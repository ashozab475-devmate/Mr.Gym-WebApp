export default function Testimonial() {
  return (
    <section id="testimonials" className="bg-stoneLight/50 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="font-display text-3xl font-medium leading-snug sm:text-4xl">
          Since the fee reminders went digital, I stopped losing track of
          when my membership renews. It just tells me.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="h-11 w-11 rounded-full bg-coral" />
          <div className="text-left">
            <p className="text-sm font-semibold">Amara Smith</p>
            <p className="text-sm text-ink/60">Member since 2024</p>
          </div>
        </div>
      </div>
    </section>
  );
}
