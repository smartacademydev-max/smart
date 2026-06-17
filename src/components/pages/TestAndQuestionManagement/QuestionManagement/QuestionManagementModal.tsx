import { Dialog, DialogContent, useTheme } from "@mui/material";
import { useState } from "react";
import type { QuestionProps } from "../../../../types/question";
import ImportQuestion from "../../../molecules/ImportQuestion";
import TabController from "../../../molecules/TabController";
import QuestionManagementForm from "./QuestionManagementForm";

export interface Props {
    open: boolean;
    setOpen: (newValue: boolean) => void;
    editData?: QuestionProps | null;
}

export default function QuestionManagementModal({ open, setOpen, editData }: Props) {
    const [activeTab, setActiveTab] = useState("upload");
    const theme = useTheme();

    useState(() => {
        if (editData) {
            setActiveTab("add");
        }
    });

    const handleClose = () => {
        setOpen(false);
        if (!editData) {
            setActiveTab("upload");
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            sx={{
                "& .MuiPaper-root": {
                    minWidth: {
                        md: "664px",
                        xl: "1266px"
                    },
                    height: "90vh",
                    overflow: "hidden"
                },
            }}
        >
            <DialogContent sx={{
                background: theme.palette.primary.contrastText
            }} className="h-full overflow-hidden flex flex-col">
                {!editData && (
                    <div className="shrink-0">
                        <TabController
                            options={[
                                { label: "Upload Questions", value: "upload" },
                                { label: "Add Question", value: "add" }
                            ]}
                            setActiveTab={setActiveTab}
                            currentActive={activeTab}
                        />
                    </div>
                )}

                <div className="flex-1 min-h-0 overflow-hidden">
                    {activeTab === "upload" && !editData && (
                        <ImportQuestion maxSize={20} onClose={handleClose} />
                    )}

                    {(activeTab === "add" || editData) && (
                        <QuestionManagementForm
                            open={open}
                            setOpen={setOpen}
                            editData={editData}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}