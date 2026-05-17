"use client";

import { AppointmentSchema } from "@/lib/schema";
import { generateTimes } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Doctor, Patient, WorkingDays } from "@/lib/generated/prisma/client"; // CHANGE 1: added WorkingDays
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { UserPen } from "lucide-react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { ProfileImage } from "../profile-image";
import { CustomInput } from "../custom-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { createNewAppointment } from "@/app/actions/appointment";

const TYPES = [
  { label: "General Consultation", value: "General Consultation" },
  { label: "General Check up", value: "General Check Up" },
  { label: "Antenatal", value: "Antenatal" },
  { label: "Maternity", value: "Maternity" },
  { label: "Lab Test", value: "Lab Test" },
  { label: "ANT", value: "ANT" },
];

// CHANGE 2: Day mapping and extended Doctor type
const DAY_MAP: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};
type DoctorWithWorkingDays = Doctor & { working_days: WorkingDays[] };

export const BookAppointment = ({
  data,
  doctors,
  defaultDoctorId,
}: {
  data: Patient;
  doctors: DoctorWithWorkingDays[]; // CHANGE 3: updated type
  defaultDoctorId?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [physicians, setPhysicians] = useState<DoctorWithWorkingDays[]>(doctors); // CHANGE 4: updated type

  const patientName = `${data?.first_name} ${data?.last_name}`;

  useEffect(() => {
    if (defaultDoctorId) {
      setOpen(true);
      form.setValue("doctor_id", defaultDoctorId);
    }
  }, [defaultDoctorId]);

  const form = useForm<z.infer<typeof AppointmentSchema>>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      doctor_id: defaultDoctorId || "",
      appointment_date: "",
      time: "",
      type: "",
      note: "",
    },
  });

  // CHANGE 5: Watch doctor and date to compute available times and validate days
  const selectedDoctorId = form.watch("doctor_id");
  const selectedDoctor = physicians.find((d) => d.id === selectedDoctorId);
  const workingDays = selectedDoctor?.working_days || [];
  const availableDayIndices = workingDays.map((wd) => DAY_MAP[wd.day.toLowerCase()]);

  const isDateDisabled = (dateStr: string) => {
    if (!dateStr || !selectedDoctor) return false;
    return !availableDayIndices.includes(new Date(dateStr).getDay());
  };

  const selectedDate = form.watch("appointment_date");
  const getAvailableTimes = () => {
    if (!selectedDate || !selectedDoctor) return generateTimes(8, 17, 30);
    const dayName = Object.keys(DAY_MAP).find(
      (key) => DAY_MAP[key] === new Date(selectedDate).getDay()
    );
    const workingDay = workingDays.find((wd) => wd.day.toLowerCase() === dayName);
    if (!workingDay) return [];
    const parseHour = (t: string) => new Date(`1970-01-01 ${t}`).getHours();
    return generateTimes(
      parseHour(workingDay.start_time),
      parseHour(workingDay.close_time),
      30
    );
  };
  const availableTimes = getAvailableTimes(); // CHANGE 6: filtered times

  const onSubmit: SubmitHandler<z.infer<typeof AppointmentSchema>> = async (values) => {
    try {
      setIsSubmitting(true);
      const newData = { ...values, patient_id: data?.id! };
      const res = await createNewAppointment(newData);

      if (res.success) {
        form.reset({});
        router.refresh();
        toast.success("Appointment created successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center gap-2 justify-start text-sm font-light bg-blue-600 text-white"
        >
          <UserPen size={16} /> Book Appointment
        </Button>
      </SheetTrigger>

      <SheetContent className="rounded-xl rounded-r-2xl md:h-p[95%] md:top-[2.5%] md:right-[1%] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span>Loading</span>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <SheetHeader>
              <SheetTitle>Book Appointment</SheetTitle>
            </SheetHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 mt-5 2xl:mt-10"
              >
                <div className="w-full rounded-md border border-input bg-background px-3 py-1 flex items-center gap-4">
                  <ProfileImage
                    url={data?.img!}
                    name={patientName}
                    className="size-16 border border-input"
                    bgColor={data?.colorCode!}
                  />
                  <div>
                    <p className="font-semibold text-lg">{patientName}</p>
                    <span className="text-sm text-gray-500 capitalize">
                      {data?.gender}
                    </span>
                  </div>
                </div>

                <CustomInput
                  type="select"
                  selectList={TYPES}
                  control={form.control}
                  name="type"
                  label="Appointment Type"
                  placeholder="Select a appointment type"
                />

                <FormField
                  control={form.control}
                  name="doctor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physician</FormLabel>
                      <Select
                        // CHANGE 7: Reset date and time when doctor changes
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("appointment_date", "");
                          form.setValue("time", "");
                        }}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a physician" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {physicians?.map((i, id) => (
                            <SelectItem key={id} value={i.id} className="p-2">
                              <div className="flex flex-row gap-2 p-2">
                                <ProfileImage
                                  url={i?.img!}
                                  name={i?.name}
                                  bgColor={i?.colorCode!}
                                  textClassName="text-black"
                                />
                                <div>
                                  <p className="font-medium text-start">
                                    {i.name}
                                  </p>
                                  <span className="text-sm text-gray-600">
                                    {i?.specialization}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2">
                  {/* CHANGE 8: Replaced CustomInput date with FormField for availability feedback */}
                  <FormField
                    control={form.control}
                    name="appointment_date"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.setValue("time", "");
                            }}
                            style={{
                              opacity:
                                selectedDoctor && isDateDisabled(field.value)
                                  ? 0.4
                                  : 1,
                            }}
                          />
                        </FormControl>
                        {selectedDoctor && workingDays.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Available: {workingDays.map((wd) => wd.day).join(", ")}
                          </p>
                        )}
                        {selectedDoctor && isDateDisabled(field.value) && field.value && (
                          <p className="text-xs text-red-500 mt-1">
                            Doctor is not available on this day.
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CHANGE 9: Use filtered availableTimes */}
                  <CustomInput
                    type="select"
                    control={form.control}
                    name="time"
                    placeholder="Select time"
                    label="Time"
                    selectList={availableTimes}
                  />
                </div>

                <CustomInput
                  type="textarea"
                  control={form.control}
                  name="note"
                  placeholder="Additional note"
                  label="Additional Note"
                />

                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="bg-blue-600 w-full"
                >
                  Submit
                </Button>
              </form>
            </Form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};