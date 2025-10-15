import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/docker/images')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/docker/images"!</div>
}
