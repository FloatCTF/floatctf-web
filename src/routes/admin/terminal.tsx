import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/terminal')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/terminal"!</div>
}
