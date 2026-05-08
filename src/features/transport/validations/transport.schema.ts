import * as yup from 'yup';

export const transportStopSchema = yup.object({
  name: yup.string().trim().required('Stop name is required'),
  time: yup.string().required('Pickup time is required'),
});

export const transportRouteCreateSchema = yup.object({
  name: yup.string().trim().required('Route name is required'),
  vehicleNo: yup.string().trim().required('Vehicle no is required'),
  driverName: yup.string().trim().required('Driver name is required'),
  driverPhone: yup.string().matches(/^[0-9]{10}$/, 'Enter valid 10-digit phone number').required('Driver phone is required'),
  startsAt: yup.string().required('Start time is required'),
  stops: yup.array(transportStopSchema).min(1, 'Add at least one stop').required(),
  status: yup.string().oneOf(['active', 'inactive']).required('Status is required'),
});

export const transportRouteUpdateSchema = transportRouteCreateSchema.shape({
  id: yup.string().required('Route id is required'),
});

export type TransportRouteCreatePayload = yup.InferType<typeof transportRouteCreateSchema>;
export type TransportRouteUpdatePayload = yup.InferType<typeof transportRouteUpdateSchema>;

