"use client";

import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Textarea,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    habitValuesSchema,
    type THabitFormInput,
    type THabitFormValues,
} from "@/schemas";
import type { THabitWithStatus } from "@/types";
import {
    COLORS,
    DAYS_OF_WEEK,
    DEFAULT_COLOR,
    FREQUENCY_TYPES,
    FREQUENCY_UNITS,
} from "../constants";

function getDefaultValues(habit?: THabitWithStatus | null): THabitFormValues {
    if (habit) {
        return {
            name: habit.name,
            description: habit.description ?? "",
            color: habit.color,
            frequencyType: habit.frequencyType,
            frequencyDaysOfWeek: habit.frequencyDaysOfWeek ?? [],
            frequencyInterval: habit.frequencyInterval ?? undefined,
            frequencyUnit: habit.frequencyUnit ?? undefined,
        };
    }
    return {
        name: "",
        description: "",
        color: DEFAULT_COLOR,
        frequencyType: "daily",
        frequencyDaysOfWeek: [],
        frequencyInterval: undefined,
        frequencyUnit: undefined,
    };
}

interface IHabitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    habit?: THabitWithStatus | null;
    onSubmit: (values: THabitFormValues) => void;
    isLoading?: boolean;
}

export const HabitDialog = ({
    open,
    onOpenChange,
    habit,
    onSubmit,
    isLoading,
}: IHabitDialogProps) => {
    const isEditMode = !!habit;
    const colorInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        control,
        formState: { errors },
    } = useForm<THabitFormInput, unknown, THabitFormValues>({
        resolver: zodResolver(habitValuesSchema),
        defaultValues: getDefaultValues(habit),
    });

    useEffect(() => {
        reset(getDefaultValues(habit));
    }, [habit, reset]);

    const frequencyType = watch("frequencyType");
    const selectedColor = watch("color") ?? DEFAULT_COLOR;
    const selectedDays = watch("frequencyDaysOfWeek") ?? [];

    const toggleDay = (day: number) => {
        const next = selectedDays.includes(day)
            ? selectedDays.filter((d) => d !== day)
            : [...selectedDays, day];
        setValue("frequencyDaysOfWeek", next, { shouldValidate: true });
    };

    const isCustomColor = !COLORS.includes(selectedColor);

    return (
        <Modal isOpen={open} onOpenChange={onOpenChange} placement="center">
            <ModalContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalHeader className="flex flex-col gap-1">
                        {isEditMode ? "Edit Habit" : "Create Habit"}
                    </ModalHeader>

                    <ModalBody className="gap-4">
                        <Input
                            label="Name"
                            labelPlacement="outside"
                            placeholder="e.g. Morning run"
                            isRequired
                            isInvalid={!!errors.name}
                            errorMessage={errors.name?.message}
                            {...register("name")}
                        />
                        <Textarea
                            label="Description"
                            labelPlacement="outside"
                            placeholder="Optional description..."
                            isInvalid={!!errors.description}
                            errorMessage={errors.description?.message}
                            {...register("description")}
                        />
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">Color</span>
                            <div className="flex flex-wrap gap-2 items-center">
                                {COLORS.map((hex) => (
                                    <button
                                        key={hex}
                                        type="button"
                                        title={hex}
                                        onClick={() =>
                                            setValue("color", hex, {
                                                shouldValidate: true,
                                            })
                                        }
                                        className={[
                                            "w-7 h-7 rounded-full border-2 transition-transform",
                                            selectedColor === hex
                                                ? "border-foreground scale-110"
                                                : "border-transparent",
                                        ].join(" ")}
                                        style={{ backgroundColor: hex }}
                                    />
                                ))}
                                <div className="relative w-7 h-7">
                                    <button
                                        type="button"
                                        title="Custom color"
                                        onClick={() =>
                                            colorInputRef.current?.click()
                                        }
                                        className={[
                                            "w-7 h-7 rounded-full border-2 transition-transform flex items-center justify-center",
                                            isCustomColor
                                                ? "border-foreground scale-110"
                                                : "border-dashed border-default-400",
                                        ].join(" ")}
                                        style={{
                                            backgroundColor: isCustomColor
                                                ? selectedColor
                                                : "transparent",
                                        }}
                                    >
                                        {!isCustomColor && (
                                            <span className="text-default-400 text-xs leading-none select-none">
                                                +
                                            </span>
                                        )}
                                    </button>
                                    <input
                                        ref={colorInputRef}
                                        type="color"
                                        value={selectedColor}
                                        onChange={(e) =>
                                            setValue("color", e.target.value, {
                                                shouldValidate: true,
                                            })
                                        }
                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer pointer-events-none"
                                        tabIndex={-1}
                                        aria-hidden
                                    />
                                </div>
                            </div>
                            {errors.color && (
                                <p className="text-danger text-xs">
                                    {errors.color.message}
                                </p>
                            )}
                        </div>
                        <Controller
                            control={control}
                            name="frequencyType"
                            render={({ field }) => (
                                <Select
                                    label="Frequency"
                                    labelPlacement="outside"
                                    selectedKeys={[field.value]}
                                    onSelectionChange={(keys) => {
                                        const val = Array.from(keys)[0] as
                                            | string
                                            | undefined;
                                        if (!val) return;
                                        field.onChange(val);
                                        setValue("frequencyDaysOfWeek", []);
                                        setValue(
                                            "frequencyInterval",
                                            undefined,
                                        );
                                        setValue("frequencyUnit", undefined);
                                    }}
                                    isInvalid={!!errors.frequencyType}
                                    errorMessage={errors.frequencyType?.message}
                                >
                                    {FREQUENCY_TYPES.map((ft) => (
                                        <SelectItem key={ft.value}>
                                            {ft.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {frequencyType === "weekly" && (
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium">
                                    Days of week
                                </span>
                                <div className="flex gap-1 flex-wrap">
                                    {DAYS_OF_WEEK.map((day) => {
                                        const isSelected =
                                            selectedDays.includes(day.value);
                                        return (
                                            <Button
                                                key={day.value}
                                                type="button"
                                                size="sm"
                                                variant={
                                                    isSelected
                                                        ? "solid"
                                                        : "bordered"
                                                }
                                                color={
                                                    isSelected
                                                        ? "primary"
                                                        : "default"
                                                }
                                                onPress={() =>
                                                    toggleDay(day.value)
                                                }
                                                className="min-w-10"
                                            >
                                                {day.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                                {errors.frequencyDaysOfWeek && (
                                    <p className="text-danger text-xs">
                                        {errors.frequencyDaysOfWeek.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {frequencyType === "custom" && (
                            <div className="flex gap-3 items-start">
                                <Input
                                    type="number"
                                    label="Every"
                                    labelPlacement="outside"
                                    placeholder="1"
                                    min={1}
                                    isInvalid={!!errors.frequencyInterval}
                                    errorMessage={
                                        errors.frequencyInterval?.message
                                    }
                                    className="flex-1"
                                    {...register("frequencyInterval", {
                                        valueAsNumber: true,
                                    })}
                                />
                                <Controller
                                    control={control}
                                    name="frequencyUnit"
                                    render={({ field }) => (
                                        <Select
                                            label="Unit"
                                            labelPlacement="outside"
                                            selectedKeys={
                                                field.value ? [field.value] : []
                                            }
                                            onSelectionChange={(keys) => {
                                                const val = Array.from(
                                                    keys,
                                                )[0] as string | undefined;
                                                if (!val) return;
                                                field.onChange(val);
                                            }}
                                            isInvalid={!!errors.frequencyUnit}
                                            errorMessage={
                                                errors.frequencyUnit?.message
                                            }
                                            className="flex-1"
                                        >
                                            {FREQUENCY_UNITS.map((u) => (
                                                <SelectItem key={u.value}>
                                                    {u.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                            </div>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            type="button"
                            variant="light"
                            onPress={() => onOpenChange(false)}
                            isDisabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            isLoading={isLoading}
                        >
                            {isEditMode ? "Update" : "Create"}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};
