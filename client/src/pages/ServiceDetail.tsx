import { useParams } from "wouter";
import ServiceDetailComponent from "@/components/services/ServiceDetail";

export default function ServiceDetail() {
  const params = useParams<{ id: string }>();
  const serviceId = parseInt(params.id);
  
  if (isNaN(serviceId)) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">ID de serviciu invalid</h2>
        <p>Identificatorul serviciului nu este valid.</p>
      </div>
    );
  }
  
  return <ServiceDetailComponent serviceId={serviceId} />;
}
