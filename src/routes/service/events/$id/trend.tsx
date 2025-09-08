import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/service/events/$id/trend')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/service/events/$id/trend"!</div>
}
