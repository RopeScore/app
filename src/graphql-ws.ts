import { ApolloLink, type Operation, type FetchResult, Observable } from '@apollo/client/core'
import { print, type GraphQLError } from 'graphql'
import { createClient, type ClientOptions, type Client } from 'graphql-ws'

interface RestartableClient extends Client {
  restart: () => void
}

function createRestartableClient (options: ClientOptions): RestartableClient {
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
    return new Observable((sink) => {
      const client = this.clients[this.currentClientIdx]
      this.currentClientIdx = (this.currentClientIdx + 1) % this.clients.length
      return client.subscribe<FetchResult>(
        { ...operation, query: print(operation.query) },
        {
          next: sink.next.bind(sink),
          complete: sink.complete.bind(sink),
          error: (err) => {
            if (err instanceof Error) {
              sink.error(err)
              return
            }

            if (err instanceof CloseEvent) {
              sink.error(
                // reason will be available on clean closes
                new Error(
                  `Socket closed with event ${err.code} ${err.reason || ''}`
                )
              )
              return
            }

            sink.error(
              Array.isArray(err)
                ? new Error((err as GraphQLError[])
                  .map(({ message }) => message)
                  .join(', '))
                : (err as GraphQLError)
            )
          }
        }
      )
    })
  }
}
