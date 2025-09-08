import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/service/top')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/service/top"!</div>
}
