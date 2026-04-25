import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Users } from "lucide-react"

export function ProjectMembersCarousel({ members }: { members: any[] }) {
  if (!members || members.length === 0) return null

  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-center gap-2 mb-3 px-1">
          <Users size={16} className="text-primary" />
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Time do Projeto</h3>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full max-w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {members.map((member, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
              <div className="p-1">
                <Card className="overflow-hidden border-none bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-white dark:hover:bg-white/10 transition-all duration-300">
                  <CardContent className="flex flex-col items-center justify-center p-4 gap-2">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20">
                      <img 
                        src={member.user?.avatarUrl || `https://ui-avatars.com/api/?name=${member.user?.name}&background=random`} 
                        alt={member.user?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center min-w-0 w-full">
                        <p className="text-[10px] font-bold text-secondary dark:text-white truncate">{member.user?.name}</p>
                        <p className="text-[8px] text-gray-500 uppercase font-medium">{member.role || 'Membro'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
            <CarouselPrevious className="-left-12" />
            <CarouselNext className="-right-12" />
        </div>
      </Carousel>
    </div>
  )
}
