import Navbar from "@/components/Navbar"
import ParticleCanvas from "@/components/ParticleCanvas"

export default function HomePage() {
  return (
    <div className="relative w-full h-dvh flex flex-col items-center justify-center bg-black">
      <Navbar />
      <ParticleCanvas />
    </div>
  )
}
