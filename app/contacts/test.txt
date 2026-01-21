"use client";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import { DatetimePicker } from "@/components/ui/datetime-picker";
import { Textarea } from "@/components/ui/textarea";
import { TagsInput } from "@/components/ui/tags-input";
import { Separator } from "@/components/ui/separator";
import { uploadFormData } from "./../Utils/Supabase/service";
import { useRouter } from "next/navigation";
import { supabase } from "../Utils/Supabase/client";
import { GeoapifyAutocomplete } from "./GeoapifyAutocomplete";
import { GeoapifyTagInput } from "./GeoapifyTagsInput";

const formSchema = z.object({
  firstName: z.string().min(1).nonempty("First name is required"),
  middleNames: z.string().min(1).optional(),
  lastName: z.string().min(1).nonempty("Last name is required"),
  phone: z.string(),
  email: z.string(),
  otherPhones: z.array(z.string()).optional(),
  otherEmails: z.array(z.string()).optional(),
  groups: z.array(z.string()).nonempty("Please add at least one item"),
  birthday: z.coerce.date(),
  anniversaries: z.array(
    z.object({
      label: z.string().optional(),
      date: z.coerce.date().optional(),
    })
  ),
  company: z.string().min(1).optional(),
  jobTitle: z.string().min(1).optional(),
  yoe: z.coerce.number().min(1).optional(),
  work: z.string().optional(),
  workLink: z.string().min(1).optional(),
  otherAddress: z.string().min(1).optional(),
  currentLocation: z.array(
    z.object({
      city: z.string(),
      country: z.string(),
      state: z.string().optional(),
      latitude: z.coerce.number(),
      longitude: z.coerce.number(),
      formatted: z.string(),
      address: z.string(),
      address2: z.string(),
      postcode: z.string(),
    })
  ),
  dreamVacation: z.string().min(1).optional(),
  previous: z
    .array(
      z.object({
        city: z.string(),
        country: z.string(),
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
      })
    )
    .optional(),
  visited: z
    .array(
      z.object({
        city: z.string(),
        country: z.string(),
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
      })
    )
    .optional(),
  interests: z.array(z.string()).optional(),
  favourites: z.string().optional(),
  instagram: z.string().min(1).optional(),
  linkedin: z.string().min(1).optional(),
  github: z.string().min(1).optional(),
  reddit: z.string().min(1).optional(),
  discord: z.string().min(1).optional(),
  other: z.string().min(1).optional(),
});

export default function MyForm() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageLoad, setPageLoad] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
      } else {
        setPageLoad(true);
      }
    };
    checkAuth();
  }, [router, supabase]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groups: [],
      // visited: [],
      birthday: new Date(),
      // previous: [],
      anniversaries: [{ label: "", date: new Date() }],
      otherPhones: [""],
      otherEmails: [""],
    },
  });

  const {
    fields: anniversaryFields,
    append: appendAnniversary,
    remove: removeAnniversary,
  } = useFieldArray({
    control: form.control,
    name: "anniversaries",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError("");

    try {
      const result = await uploadFormData(values);

      if (result.error) {
        toast.error("Failed to Upload Data " + result);
      } else {
        toast.success("Profile uploaded successfully!");
        const userName = values.firstName || "";
        await supabase.auth.signOut();
        router.push(`/thank-you?user=${encodeURIComponent(userName)}`);
      }
    } catch (err) {
      setError("Form submission failed");
      toast.error("Failed to submit the form. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!pageLoad) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  } else {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 sm:space-y-8 max-w-3xl mx-auto py-4 md:py-10 px-4 sm:px-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-lg border p-4 sm:p-6 gap-4 md:gap-0">
            <div className="space-y-0.5 w-full">
              <FormLabel className="text-base sm:text-lg">Hey there {}!</FormLabel>
              <FormDescription className="text-xs sm:text-sm md:text-base leading-relaxed">
                Hi! I'm Jonathan. Whether we're old friends or new
                acquaintances, I'd love to get to know you better through this
                form. I'm especially interested in learning who to turn to when
                I need advice about moving to a new city (which you may have
                lived in at some point) or trying out new activities that you
                may be interested in. Feel free to answer as much as you like —
                the more details, the better! Without further ado, let's get
                started.
              </FormDescription>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-lg border p-4 sm:p-6 gap-4 md:gap-0">
            <div className="space-y-0.5 flex-1 w-full">
              <p className="text-sm sm:text-base font-medium leading-none">
                Terms of Data Use<span className="text-red-600">*</span>
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
                This is a personal project, and all the information you provide
                will be used solely for my personal use. Your data will be
                stored privately on my home computer and will not be shared
                publicly. If you don't feel comfortable sharing this
                information, that's completely fine!
              </p>
            </div>
            <Switch
              checked={termsAccepted}
              onCheckedChange={setTermsAccepted}
              aria-readonly
              className="mt-2 md:mt-0 md:ml-4 shrink-0"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
            <div className="sm:col-span-1 md:col-span-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      First Name<span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl
                      className={`${!termsAccepted ? "disabled-overlay" : ""}`}
                    >
                      <Input placeholder="Jonathan" type="" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-1 md:col-span-4">
              <FormField
                control={form.control}
                name="middleNames"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Middle Name(s)</FormLabel>
                    <FormControl
                      className={`${!termsAccepted ? "disabled-overlay" : ""}`}
                    >
                      <Input placeholder="Rufus!?" type="" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-1 sm:col-start-1 md:col-span-4 md:col-start-9">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Last Name<span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl
                      className={`${!termsAccepted ? "disabled-overlay" : ""}`}
                    >
                      <Input placeholder="Samuel" type="" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
            <div className="sm:col-span-1 md:col-span-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start">
                    <FormLabel className="text-sm sm:text-base">
                      Phone number<span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl
                      className={`w-full ${
                        !termsAccepted ? "disabled-overlay" : ""
                      }`}
                    >
                      <PhoneInput
                        placeholder="+91-8197604647"
                        {...field}
                        defaultCountry="IN"
                      />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      Enter your primary phone number, ideally the one you use
                      Whatsapp with.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="sm:col-span-1 md:col-span-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Email<span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className={`${
                          !termsAccepted ? "disabled-overlay" : ""
                        }`}
                        placeholder="jonathansamuel296@gmail.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      Enter your primary email. Ideally the one you check the
                      most.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 lg:col-span-4">
              <FormField
                control={form.control}
                name="groups"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      How do we know each other?
                      <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <MultiSelector
                        values={field.value}
                        onValuesChange={field.onChange}
                        loop
                        className={`min-w-full ${
                          !termsAccepted ? "disabled-overlay" : ""
                        }`}
                      >
                        <MultiSelectorTrigger>
                          <MultiSelectorInput placeholder="Select connection type" />
                        </MultiSelectorTrigger>
                        <MultiSelectorContent>
                          <MultiSelectorList>
                            <MultiSelectorItem value="FAMILY">
                              Family
                            </MultiSelectorItem>
                            <MultiSelectorItem value="FRIENDS">
                              Friends
                            </MultiSelectorItem>
                            <MultiSelectorItem value="WORK">
                              Work
                            </MultiSelectorItem>
                            <MultiSelectorItem value="SCHOOL">
                              School
                            </MultiSelectorItem>
                            <MultiSelectorItem value="COLLEGE">
                              College
                            </MultiSelectorItem>
                            <MultiSelectorItem value="ACQUAINTANCES">
                              Acquaintances
                            </MultiSelectorItem>
                            <MultiSelectorItem value="WE JUST MET">
                              WE JUST MET
                            </MultiSelectorItem>
                            <MultiSelectorItem value="COMMUNITY">
                              Community
                            </MultiSelectorItem>
                            <MultiSelectorItem value="OTHER">
                              Other
                            </MultiSelectorItem>
                          </MultiSelectorList>
                        </MultiSelectorContent>
                      </MultiSelector>
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      Feel free to select as many that apply! Any 3rd places
                      would go into Community (The Library, Through Sports,
                      Online, etc)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator className="my-4" />

          <FormField
            control={form.control}
            name="birthday"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm sm:text-base">
                  Add your Birthday!<span className="text-red-600">*</span>
                </FormLabel>
                <DatetimePicker
                  className={`${!termsAccepted ? "disabled-overlay" : ""}`}
                  {...field}
                  format={[["days", "months", "years"], []]}
                />
                <FormDescription className="text-xs sm:text-sm">
                  Funnily enough this is what inspired me to build this project
                  XD
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="anniversaries"
            render={() => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Special Dates & Descriptions</FormLabel>
                <FormDescription className="text-xs sm:text-sm">
                  Add any memorable dates along with a description.
                </FormDescription>

                {anniversaryFields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 ${
                      !termsAccepted ? "disabled-overlay" : ""
                    }`}
                  >
                    {/* Label Input */}
                    <FormControl className="w-full sm:flex-1">
                      <Input
                        placeholder="E.g. Wedding Anniversary"
                        {...form.register(`anniversaries.${index}.label`)}
                        className="w-full"
                      />
                    </FormControl>

                    {/* Date Picker */}
                    <FormControl className="w-full sm:flex-1">
                      <DatetimePicker
                        {...form.register(
                          `anniversaries.${index}.date` as const
                        )}
                        value={form.watch(`anniversaries.${index}.date`)}
                        onChange={(val) =>
                          form.setValue(
                            `anniversaries.${index}.date`,
                            val ?? new Date()
                          )
                        }
                        format={[["days", "months", "years"], []]}
                        className="w-full"
                      />
                    </FormControl>

                    {/* Remove Button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeAnniversary(index)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className={`w-full sm:w-auto ${!termsAccepted ? "disabled-overlay" : ""}`}
                  onClick={() =>
                    appendAnniversary({ label: "", date: new Date() })
                  }
                >
                  + Add Row
                </Button>

                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="my-4" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-lg border p-4 sm:p-6 gap-4 md:gap-0">
            <div className="space-y-0.5 w-full">
              <FormLabel className="text-base sm:text-lg">Your Work</FormLabel>
              <FormDescription className="text-xs sm:text-sm md:text-base">
                Completely Optional! But I'd still love to know more about what
                you do!
              </FormDescription>
            </div>
          </div>

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Current Company</FormLabel>
                <FormControl>
                  <Input
                    className={`${!termsAccepted ? "disabled-overlay" : ""}`}
                    placeholder="CERN"
                    type=""
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  Enter the name of the current company you work in!
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
            <div className="sm:col-span-1 md:col-span-6">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Your Job Title</FormLabel>
                    <FormControl
                      className={`${!termsAccepted ? "disabled-overlay" : ""}`}
                    >
                      <Input placeholder="DevOps Engineer" type="" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-1 md:col-span-6">
              <FormField
                control={form.control}
                name="yoe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Years of Experience</FormLabel>
                    <FormControl
                      className={`${!termsAccepted ? "disabled-overlay" : ""}`}
                    >
                      <Input placeholder="4" type="number" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Other Phone Numbers */}
            <div className="md:col-span-6 space-y-4">
              {(form.watch("otherPhones") || []).map((_, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`otherPhones.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex-1 space-y-2 flex flex-col w-full">
                        <FormLabel className="text-sm sm:text-base">Work Phone Number</FormLabel>
                        <FormControl
                          className={`w-full ${
                            !termsAccepted ? "disabled-overlay" : ""
                          }`}
                        >
                          <PhoneInput
                            placeholder="+41-22-766-67-59"
                            {...field}
                            defaultCountry="CH"
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Your primary phone number (e.g. WhatsApp).
                        </FormDescription>
                        <FormMessage />
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        disabled={!termsAccepted}
                        onClick={() => {
                          const current = form.getValues("otherPhones") || [];
                          const updated = [...current];
                          updated.splice(index, 1);
                          form.setValue("otherPhones", updated);
                        }}
                        className="shrink-0 w-full sm:w-auto"
                      >
                        X
                      </Button>
                    </FormItem>
                  )}
                />
              ))}

              {/* Add Phone Button outside map for better UX */}
              <Button
                type="button"
                onClick={() => {
                  const current = form.getValues("otherPhones") || [];
                  form.setValue("otherPhones", [...current, ""]);
                }}
                variant="outline"
                className={`w-full sm:w-auto ${!termsAccepted ? "disabled-overlay" : ""}`}
              >
                + Add Phone
              </Button>
            </div>

            {/* Other Emails */}
            <div className="md:col-span-6 space-y-4">
              {(form.watch("otherEmails") || []).map((_, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`otherEmails.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex-1 space-y-2 flex flex-col w-full">
                        <FormLabel className="text-sm sm:text-base">Work Email</FormLabel>
                        <FormControl>
                          <Input
                            className={`${
                              !termsAccepted ? "disabled-overlay" : ""
                            }`}
                            placeholder="jonathan.rufus.samuel@cern.ch"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          The email you check most often.
                        </FormDescription>
                        <FormMessage />
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        disabled={!termsAccepted}
                        onClick={() => {
                          const current = form.getValues("otherEmails") || [];
                          const updated = [...current];
                          updated.splice(index, 1);
                          form.setValue("otherEmails", updated);
                        }}
                        className="shrink-0 w-full sm:w-auto"
                      >
                        X
                      </Button>
                    </FormItem>
                  )}
                />
              ))}

              {/* Add Email Button outside map */}
              <Button
                type="button"
                onClick={() => {
                  const current = form.getValues("otherEmails") || [];
                  form.setValue("otherEmails", [...current, ""]);
                }}
                variant="outline"
                className={`w-full sm:w-auto ${!termsAccepted ? "disabled-overlay" : ""}`}
              >
                + Add Email
              </Button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="work"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Is there anything interesting that you work on?
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Feel free to mention something interesting that you work on! (Especially if it's within Computer Science XD)"
                    className={`resize-none ${
                      !termsAccepted ? "disabled-overlay" : ""
                    }`}
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Other Links</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://jrs-studios.web.cern.ch/"
                    type=""
                    className={`${!termsAccepted ? "disabled-overlay" : ""}`}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  If you have a site that you think would be worth visitng, drop
                  it below!{" "}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="my-4" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-lg border p-4 sm:p-6 gap-4 md:gap-0">
            <div className="space-y-0.5 w-full">
              <FormLabel className="text-base sm:text-lg">Your Global Footprint</FormLabel>
              <FormDescription className="text-xs sm:text-sm md:text-base leading-relaxed">
                This was another important reason for building this. You'd be
                surprised by how much of a global reach one may have, and I hope
                to learn from you about the places you have been to, and the
                places you would like to go to! Please do take the time to fill
                out your previous addresses, as well as places that you have
                visited. It's not a requirement, but it would be awesome to
                know!
              </FormDescription>
            </div>
          </div>

          <FormField
            control={form.control}
            name="currentLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Your Address<span className="text-red-600">*</span>
                </FormLabel>
                <FormControl className={`${!termsAccepted ? "disabled-overlay" : ""}`}>
                  <GeoapifyAutocomplete
                    value={field.value || []}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  Add your current address. If you would not like to share your
                  complete address, please mention your current city, that would
                  do.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otherAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Other Address Details</FormLabel>
                <FormControl>
                  <Input
                    className={`${!termsAccepted ? "disabled-overlay" : ""}`}
                    placeholder="Add other details about your address"
                    type=""
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  If the prompt from the address search isn't as accurate, feel free to share any other details here.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="previous"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Previously Lived<span className="text-red-600">*</span>
                </FormLabel>
                <FormControl className={`${!termsAccepted ? "disabled-overlay" : ""}`}>
                  <GeoapifyTagInput
                    value={field.value || []}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  Add previous locations you've lived in. These could be places
                  you've done internships at, your childhood home, etc.
                  Basically any place that you've lived in for more than 6
                  months.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />          

          <FormField
            control={form.control}
            name="dreamVacation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  If you had to take a dream vacation, Where would it be?
                </FormLabel>
                <FormControl>
                  <Input
                    className={`${!termsAccepted ? "disabled-overlay" : ""}`}
                    placeholder="Tromsø - Norway"
                    type=""
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  Feel free to share it as City - Country. Eg: Barcelona -
                  Spain.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visited"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Visited Places<span className="text-red-600">*</span>
                </FormLabel>
                <FormControl className={`${!termsAccepted ? "disabled-overlay" : ""}`}>
                  <GeoapifyTagInput
                    value={field.value || []}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  Add all the places that you have visited. Please do try adding
                  as many as you can! And kindly note the distintion between
                  places visited and lived in previously.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />          

          <Separator className="my-4" />

          <FormField
            control={form.control}
            name="interests"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Interests and Hobbies</FormLabel>
                <FormControl
                  className={`${!termsAccepted ? "disabled-overlay" : ""}`}
                >
                  <TagsInput
                    value={field.value ?? []}
                    onValueChange={field.onChange}
                    placeholder="Enter your tags"
                  />
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  Are there any interests or hobbies that you have? Enter them
                  one by one! Same format. Music - I play the Piano, Sports - I
                  love Football!
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="favourites"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Favourites and Extras</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Type away!"
                    className={`resize-none ${!termsAccepted ? "disabled-overlay" : ""}`}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  Add anything that you've loved recently! (Or for a long time).
                  A favourite book, TV Show, A Spotify Platylist that you really
                  like. Feel free to drop anything you like here!
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="my-4" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-lg border p-4 sm:p-6 gap-4 md:gap-0">
            <div className="space-y-0.5 w-full">
              <FormLabel className="text-base sm:text-lg">Socials</FormLabel>
              <FormDescription className="text-xs sm:text-sm md:text-base">
                And Last but not the least, your socials! I would love to
                connect with you on these platforms. Feel free to share as many
                as you like!
              </FormDescription>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
            <div className="sm:col-span-1 md:col-span-6">
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Instagram</FormLabel>
                    <FormControl>
                      <Input
                        className={`${
                          !termsAccepted ? "disabled-overlay" : ""
                        }`}
                        placeholder="https://www.instagram.com/"
                        type=""
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-1 md:col-span-6">
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">LinkedIn</FormLabel>
                    <FormControl>
                      <Input
                        className={`${
                          !termsAccepted ? "disabled-overlay" : ""
                        }`}
                        placeholder="https://www.linkedin.com/in/jrs2002/"
                        type=""
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
            <div className="sm:col-span-1 md:col-span-6">
              <FormField
                control={form.control}
                name="discord"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Discord</FormLabel>
                    <FormControl>
                      <Input
                        className={`${
                          !termsAccepted ? "disabled-overlay" : ""
                        }`}
                        placeholder="JRS296"
                        type=""
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-1 md:col-span-6">
              <FormField
                control={form.control}
                name="reddit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Reddit</FormLabel>
                    <FormControl>
                      <Input
                        className={`${
                          !termsAccepted ? "disabled-overlay" : ""
                        }`}
                        placeholder="u/jrs296"
                        type=""
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
            <div className="sm:col-span-1 md:col-span-6">
              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">GitHub</FormLabel>
                    <FormControl>
                      <Input
                        className={`${
                          !termsAccepted ? "disabled-overlay" : ""
                        }`}
                        placeholder="JRS296"
                        type=""
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="other"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Others</FormLabel>
                <FormControl>
                  <Input
                    className={`${!termsAccepted ? "disabled-overlay" : ""}`}
                    placeholder="Facebook?"
                    type=""
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs sm:text-sm">
                  Add any other socials you would like to stay connected
                  through!
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="my-4" />

          <div className="">
            <FormLabel className="text-sm sm:text-base">Review Your Answers</FormLabel>
            <FormDescription className="text-xs sm:text-sm">Please Review All your Answers</FormDescription>
          </div>

          <Button type="submit" className="w-full sm:w-auto">{loading ? "Submitting..." : "Submit"}</Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </Form>
    );
  }
}
