import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { useStakeholders } from "@/hooks/useStakeholders";
import { useProducts } from "@/hooks/useProducts";
import { useHighlight } from "@/lib/HighlightContext";
import CanvasAvatar from "@/components/sidebar/CanvasAvatar";

// Stakeholders grouped by department; each row shows a live count of products
// they're attached to (a client-side stand-in for the joined aggregate query).
export default function StakeholderList() {
  const { data: stakeholders = [] } = useStakeholders();
  const { data: products = [] } = useProducts();
  const { highlightedIds, toggleHighlight } = useHighlight();
  const departments = [...new Set(stakeholders.map((s) => s.department))];

  const productCountFor = (stakeholderId) =>
    products.filter((p) => p.stakeholder_ids?.includes(stakeholderId)).length;

  return (
    <Accordion type="multiple" className="w-full">
      {departments.map((dept) => (
        <AccordionItem key={dept} value={dept}>
          <AccordionTrigger className="text-sm">{dept}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {stakeholders.filter((s) => s.department === dept).map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={highlightedIds.includes(s.id)}
                    onCheckedChange={() => toggleHighlight(s.id)}
                  />
                  <CanvasAvatar name={s.name} avatarUrl={s.avatar_url} />
                  <span className="text-xs flex-1">{s.name}</span>
                  <span className="text-[10px] text-muted-foreground">{productCountFor(s.id)} products</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}