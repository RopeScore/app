import { ApolloLink, type Operation, type FetchResult, Observable, ApolloError } from '@apollo/client/core'
import { isNonNullObject } from '@apollo/client/utilities'
import { print, type FormattedExecutionResult } from 'graphql'
import { createClient, type ClientOptions, type Client, type Sink } from 'graphql-ws'

interface RestartableClient extends Client {
  restart: () => void
}

export function createRestartableClient (options: ClientOptions): RestartableClient {
  let restartRequested = false
  let restart = () => {
    restartRequested = true
  }

  const client = createClient({
    ...options,
    on: {
      ...options.on,
      opened: (socket) => {
        options.on?.opened?.(socket)

        restart = () => {
          if ((socket as WebSocket).readyState === WebSocket.OPEN) {
            // if the socket is still open for the restart, do the restart
            ; (socket as WebSocket).close(4205, 'Client Restart')
          } else {
            // otherwise the socket might've closed, indicate that you want
            // a restart on the next opened event
            restartRequested = true
          }
        }

        // just in case you were eager to restart
        if (restartRequested) {
          restartRequested = false
          restart()
        }
      }
    }
  })

  return {
    ...client,
    restart: () => { restart() }
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close_event
function isLikeCloseEvent (val: unknown): val is CloseEvent {
  return isNonNullObject(val) && 'code' in val && 'reason' in val
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/error_event
function isLikeErrorEvent (err: unknown): err is Event {
  return isNonNullObject(err) && err.target?.readyState === WebSocket.CLOSED
}

export class WebSocketLink extends ApolloLink {
  readonly clients: RestartableClient[]
  private currentClientIdx = 0

  constructor (options: ClientOptions & { numConnections?: number }) {
    super()
    this.clients = new Array(options.numConnections ?? 1)
      .fill(undefined)
      .map(() => createRestartableClient(options))
  }

  public request (operation: Operation): Observable<FetchResult> {
    return new Observable((observer) => {
      const client = this.clients[this.currentClientIdx]
      this.currentClientIdx = (this.currentClientIdx + 1) % this.clients.length
      return client.subscribe<FetchResult>(
        { ...operation, query: print(operation.query) },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        {
          next: observer.next.bind(observer),
          complete: observer.complete.bind(observer),
          error: (err: unknown) => {
            if (err instanceof Error) {
              observer.error(err); return
            }
            const likeClose = isLikeCloseEvent(err)
            if (likeClose || isLikeErrorEvent(err)) {
              observer.error(
                // reason will be available on clean closes
                new Error(
                  `Socket closed${likeClose ? ` with event ${err.code}` : ''}${
                    likeClose ? ` ${err.reason}` : ''
                  }`
                )
              ); return
            }

            observer.error(
              new ApolloError({
                graphQLErrors: Array.isArray(err) ? err : [err],
              })
            )
          },
          // casting around a wrong type in graphql-ws, which incorrectly expects `Sink<ExecutionResult>`
        } satisfies Sink<FormattedExecutionResult> as any
      )
    })
  }
}
