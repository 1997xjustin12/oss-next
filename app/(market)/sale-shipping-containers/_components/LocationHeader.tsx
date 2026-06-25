import { MapPin } from "lucide-react";

const PTYPE_HEADINGS: Record<string, string> = {
  buy:         'Shipping Containers for Sale Near Me',
  rental:      'Shipping Containers for Rent Near Me',
  rto:         'Shipping Containers for Rent-To-Own Near Me',
  accessories: 'Shipping Container Accessories',
}

type Props = {
  location?: string;
  zipcode?: string;
  ptype?: string;
};

export function LocationHeader({ location, zipcode, ptype = 'buy' }: Props) {
  const heading = PTYPE_HEADINGS[ptype] ?? PTYPE_HEADINGS.buy
  return (
    <div className="px-[5%] py-4">
      <div className="text-2xl font-extrabold text-theme-dark dark:text-gray-100">
        {heading}
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        {location && (
          <>
            <MapPin className="w-5 h-5 text-theme-primary shrink-0" />
            <div className="text-3xl sm:text-4xl font-black text-theme-primary">
              {location}
            </div>
          </>
        )}
      </div>
      {/* {zipcode && (
        <div className="text-sm text-theme-muted mt-0.5">ZIP: {zipcode}</div>
      )} */}
    </div>
  );
}
