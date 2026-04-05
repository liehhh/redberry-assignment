import { useParams } from 'react-router-dom'

export default function CourseDetail() {
  const { id } = useParams()

  return (
    <div className="max-w-[1920px] mx-auto">
      <div className="px-8 lg:px-16 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Course Detail</h1>
        <p className="text-gray-500">Course ID: {id} — Coming soon.</p>
      </div>
    </div>
  )
}
