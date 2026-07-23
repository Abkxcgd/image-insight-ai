import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Are my images uploaded anywhere?",
    a: "No. VisionAI runs the entire model inside your browser using TensorFlow.js. Your images never leave your device.",
  },
  {
    q: "Which model powers the predictions?",
    a: "MobileNet v2 with a depth multiplier of 1.0, pretrained on ImageNet (1000 classes).",
  },
  {
    q: "Why is the first prediction slower than the rest?",
    a: "The first inference initialises WebGL shaders and warms up the model. Subsequent predictions are noticeably faster.",
  },
  {
    q: "Which file types are supported?",
    a: "JPG, PNG, WEBP, and GIF up to 10MB. Larger images are automatically compressed before inference.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. The UI is fully responsive and the model runs on any modern browser with WebGL support.",
  },
  {
    q: "Where is my prediction history stored?",
    a: "Only in your browser's local storage. Clearing your browser data or using the Settings page removes it.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently asked <span className="gradient-text">questions</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          Everything you might be wondering about VisionAI.
        </p>
      </div>
      <div className="glass mt-10 rounded-2xl p-2 sm:p-4">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border-b border-border/50 last:border-0">
              <AccordionTrigger className="text-left text-base font-medium">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
