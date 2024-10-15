'use client'
import Link from "next/link"
 
export default function Error({
  error,
}: {
  error: Error & { digest?: string }
}) {
  return (
    <div>
      <h2>{`${error}`}</h2>
      <Link href={`${process.env.NEXT_PUBLIC_API_URL}`}></Link>
    </div>
  )
}