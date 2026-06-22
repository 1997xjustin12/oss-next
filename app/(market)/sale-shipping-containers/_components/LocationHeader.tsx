import { MapPin } from "lucide-react";

type Props = {
  location?: string;
  zipcode?: string;
};

export function LocationHeader({ location, zipcode }: Props) {
  return (
    <div className="px-[5%] py-4">
      <div className="text-2xl font-extrabold text-theme-dark">
        Shipping Containers for Sale Near Me
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
      {zipcode && (
        <div className="text-sm text-theme-muted mt-0.5">ZIP: {zipcode}</div>
      )}
    </div>
  );
}
