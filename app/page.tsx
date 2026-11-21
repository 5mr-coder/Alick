import HeroParallax from '@/components/home/HeroParallax';
import TrustStrip from '@/components/home/TrustStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import FlashSales from '@/components/home/FlashSales';
import CategoryGrid from '@/components/home/CategoryGrid';
import ServicesPreview from '@/components/home/ServicesPreview';
import BlogPreview from '@/components/home/BlogPreview';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Button from '@/components/ui/Button';
import {
  getActiveServices,
  getFeaturedProducts,
  getFlashSaleProducts,
  getHomeHeroBanner,
  getPublicSiteSettings,
  getPublishedBlogPosts,
} from '@/lib/db/queries';

export const revalidate = 60;

export default async function HomePage() {
  const [banner, featured, flashData, services, blogPosts, settings] =
    await Promise.all([
      getHomeHeroBanner(),
      getFeaturedProducts(),
      getFlashSaleProducts(),
      getActiveServices(),
      getPublishedBlogPosts({ limit: 3 }),
      getPublicSiteSettings(),
    ]);

  const whatsappDigits =
    settings.whatsapp_number.replace(/\D/g, '') || '2348030841357';

  return (
    <>
      <HeroParallax banner={banner} />
      <TrustStrip />
      <FeaturedProducts products={featured} />
      <FlashSales products={flashData.products} endsAt={flashData.earliestEnd} />
      <CategoryGrid />
      <ServicesPreview services={services} />
      <BlogPreview posts={blogPosts} />

      <section
        className="section"
        style={{
          background:
            'linear-gradient(135deg, var(--ash-800) 0%, var(--ash-900) 100%)',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <AnimatedSection>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h2 className="section-heading" style={{ marginBottom: '1rem' }}>
                Need help choosing?{' '}
                <span className="text-gradient">Talk to us.</span>
              </h2>
              <p
                style={{
                  color: 'var(--ash-400)',
                  marginBottom: '2rem',
                  fontSize: '1rem',
                }}
              >
                Our team is ready to help you find the right laptop or gadget
                for your budget and needs. Walk in or reach us on WhatsApp.
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  size="lg"
                  href={`https://wa.me/${whatsappDigits}`}
                  icon={
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  }
                  iconPosition="left"
                >
                  Chat on WhatsApp
                </Button>
                <Button size="lg" variant="outline" href="/contact">
                  Contact Us
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
