import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/shared/page-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal } from "@/components/shared/reveal";
import { createClient } from "@/lib/supabase/server";

async function getGalleryItems() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("gallery_items")
      .select("id, image_url, caption, category")
      .order("created_at", { ascending: false });

    return data ?? [];
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Moments from the workshop floor"
        description="Workshops, competitions, and everyday club life."
      />

      <section className="py-16 sm:py-20">
        <Container>
          {items.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="No photos yet"
              description="Gallery images will show up here once the club starts posting them."
            />
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {items.map((item, i) => (
                <Reveal key={item.id} delay={(i % 6) * 0.05} className="mb-4 break-inside-avoid">
                  <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface-elevated">
                    <Image
                      src={item.image_url}
                      alt={item.caption ?? "Gallery photo"}
                      width={600}
                      height={450}
                      className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {item.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <p className="text-sm">{item.caption}</p>
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
