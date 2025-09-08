import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/service/events/$id/challenges')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/service/events/$id/challenges"!</div>
}
