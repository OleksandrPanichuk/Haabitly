"use client";

import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@heroui/react";
import { AlertTriangleIcon } from "lucide-react";
import type { THabitWithStatus } from "@/types";

interface IHabitDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    habit: THabitWithStatus | null;
    onConfirm: () => void;
    isLoading?: boolean;
}

export const HabitDeleteDialog = ({
    open,
    onOpenChange,
    habit,
    onConfirm,
    isLoading,
}: IHabitDeleteDialogProps) => {
    return (
        <Modal
            isOpen={open}
            onOpenChange={onOpenChange}
            placement="center"
            size="sm"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-danger/10 flex-shrink-0">
                            <AlertTriangleIcon
                                size={20}
                                className="text-danger"
                            />
                        </div>
                        <span className="text-lg font-semibold">
                            Delete Habit
                        </span>
                    </div>
                </ModalHeader>

                <ModalBody className="pb-2">
                    <p className="text-foreground-600 text-sm leading-relaxed">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">
                            &quot;{habit?.name}&quot;
                        </span>
                        ? This will permanently remove the habit and all its
                        completion history.
                    </p>
                    <p className="text-foreground-400 text-xs mt-1">
                        This action cannot be undone.
                    </p>
                </ModalBody>

                <ModalFooter>
                    <Button
                        variant="light"
                        onPress={() => onOpenChange(false)}
                        isDisabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="danger"
                        onPress={onConfirm}
                        isLoading={isLoading}
                    >
                        Delete
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
