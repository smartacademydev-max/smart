import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { Box, FormHelperText, InputLabel } from "@mui/material";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useUploadMediaImageMutation } from "../../services/mediaApi";

function createUploadAdapterPlugin(uploadImage: any) {
    return function (editor: any) {
        editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => {
            return {
                upload: async () => {
                    try {
                        const file = await loader.file;
                        const formData = new FormData();
                        formData.append("upload", file);
                        const response = await uploadImage({ body: formData }).unwrap();
                        return { default: response?.data?.url };
                    } catch (err) {
                        console.error("Upload failed:", err);
                        throw err;
                    }
                },
                abort: () => { },
            };
        };
    };
}

export interface TextEditorHandle {
    insertAtCursor: (text: string) => void;
}

interface TextEditorProps {
    label?: string;
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
    required?: boolean;
}

const TextEditor = forwardRef<TextEditorHandle, TextEditorProps>(function TextEditor(
    { label, error, value, onChange, onBlur, required },
    ref
) {
    const [data, setData] = useState(value || "");
    const prevValueRef = useRef(value);
    const ckEditorRef = useRef<any>(null);
    const [uploadImage] = useUploadMediaImageMutation();

    const uploadPlugin = useCallback(createUploadAdapterPlugin(uploadImage), [uploadImage]);

    useEffect(() => {
        if (value !== prevValueRef.current) {
            setData(value || "");
            prevValueRef.current = value;
        }
    }, [value]);

    useImperativeHandle(ref, () => ({
        insertAtCursor: (text: string) => {
            const editor = ckEditorRef.current;
            if (!editor) return;
            editor.model.change((writer: any) => {
                const position = editor.model.document.selection.getFirstPosition();
                if (position) writer.insertText(text, position);
            });
            const updated = editor.getData();
            setData(updated);
            onChange?.(updated);
        },
    }));

    return (
        <Box className="input__field" sx={{ height: "calc(100%)" }}>
            <InputLabel className={required ? "required" : ""}>
                {label || "Description"}
            </InputLabel>

            <div
                className="editor__wrapper general__content__box styled__list"
                style={{
                    border: "1px solid #E5E7EB",
                    height: "100%",
                    padding: "16px",
                    borderRadius: "8px",
                    overflowY: "auto",
                }}
            >
                <CKEditor
                    editor={ClassicEditor as any}
                    data={data}
                    config={{
                        extraPlugins: [uploadPlugin],
                        // toolbar: [
                        //     "heading", "|",
                        //     "bold", "italic", "link", "|",
                        //     "bulletedList", "numberedList", "|",
                        //     "imageUpload", "blockQuote", "|",
                        //     "undo", "redo",
                        // ],
                        toolbar: [
                            "heading", "MathType", "ChemType", "|",
                            "bold", "italic", "link", "|",
                            "bulletedList", "numberedList", "|",
                            "imageUpload", "blockQuote", "insertTable", "|",
                            "undo", "redo",
                        ],
                    }}
                    onReady={(editor) => {
                        ckEditorRef.current = editor;
                    }}
                    onChange={(_, editor) => {
                        const val = editor.getData();
                        setData(val);
                        onChange?.(val);
                    }}
                    onBlur={(_, editor) => {
                        const val = editor.getData();
                        onBlur?.(val);
                    }}
                />
            </div>

            {error && <FormHelperText error>{error}</FormHelperText>}
        </Box>
    );
});

export default TextEditor;
