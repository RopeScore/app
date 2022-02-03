import { ApolloLink, Operation, FetchResult, Observable } from '@apollo/client/core'
import { print, GraphQLError } from 'graphql'
import { createClient, ClientOptions, Client } from 'graphql-ws'

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
    restart: () => restart()
  }
}

export class WebSocketLink extends ApolloLink {
  readonly client: RestartableClient

  constructor (options: ClientOptions) {
    super()
    this.client = createRestartableClient(options)
  }

  public request (operation: Operation): Observable<FetchResult> {
    return new Observable((sink) => {
      return this.client.subscribe<FetchResult>(
        { ...operation, query: print(operation.query) },
        {
          next: sink.next.bind(sink),
          complete: sink.complete.bind(sink),
          error: (err) => {
            if (err instanceof Error) {
              return sink.error(err)
            }

            if (err instanceof CloseEvent) {
              return sink.error(
                // reason will be available on clean closes
                new Error(
                  `Socket closed with event ${err.code} ${err.reason || ''}`
                )
              )
            }

            return sink.error(
              new Error(
                (err as GraphQLError[])
                  .map(({ message }) => message)
                  .join(', ')
              )
            )
          }
        }
      )
    })
  }
}
