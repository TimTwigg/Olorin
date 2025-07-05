import * as React from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
// import { FileUpload } from "primereact/fileupload";
import { InputTextarea } from "primereact/inputtextarea";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
// import { toast } from "react-toastify";
import { useForm, ValidationError } from "@formspree/react";
import * as api from "@src/controllers/api";

export const Route = createLazyFileRoute("/support")({
    component: Support,
})

function Support() {
    const [value, setValue] = React.useState("");
    const descriptionRef = React.useRef<HTMLTextAreaElement>(null);
    const [state, handleSubmit] = useForm("xkgbqozz");
    const [email, SetEmail] = React.useState<string>("");
    const metaRef = React.useRef<number>(0);

    React.useEffect(() => {
        if (metaRef.current === 0) {
            metaRef.current = 1;
            api.getMetadata().then((data) => {
                if (data.Metadata.has("email")) {
                    SetEmail(data.Metadata.get("email")!);
                }
            });
        }
    }, []);

    // const handleSubmit = async () => {
    //     if (value.trim() === "") {
    //         toast.error("Please provide a description.");
    //         descriptionRef.current?.focus();
    //         return;
    //     }
    //     console.log("Support request submitted:", value);
    //     api.sendSupportRequest(value).then((res) => {
    //         if (res) {
    //             toast.success("Support request submitted successfully!");
    //             setValue("");
    //         }
    //         else {
    //             toast.error("Failed to submit support request. Please try again later.");
    //         }
    //     })
    // }

    if (state.succeeded) {
        return (
            <div>
                <h1>Support Request Submitted</h1>
                <p className="middle eight columns offset-by-two columns">
                    Thank you for reaching out! Your support request has been submitted successfully.
                    We will get back to you as soon as possible.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1>Support</h1>
            <p className="middle eight columns offset-by-two columns">
                If you encounter any issues or have questions about Olorin, please reach out using the form below. <br />
                {/* You can also upload screenshots that might help us understand the issue better. */}
                We will get back to you as soon as possible.
            </p>
            <div className="space" />
            <form className="eight columns offset-by-two columns" onSubmit={handleSubmit}>
                <label htmlFor="email">Email Address</label>
                <input id="email" type="email" name="email" defaultValue={email} required />
                <ValidationError 
                    prefix="Email" 
                    field="email"
                    errors={state.errors}
                />
                <div className="space" />

                {/* <FileUpload name="image_uploader" url={"/api/upload"} multiple accept="image/*" maxFileSize={1000000} emptyTemplate={<p>Drag and drop files to here to upload.</p>} /> */}
                {/* <div className="space" /> */}
                <FloatLabel>
                    <InputTextarea id="description" name="Description" ref={descriptionRef} value={value} onChange={(e) => setValue(e.target.value)} rows={5} style={{ width: "100%" }} autoResize required />
                    <label htmlFor="description">Description</label>
                </FloatLabel>
                <ValidationError field="Description" prefix="Description" errors={state.errors} />

                <div className="space" />
                <Button label="Submit" type="submit" className="two columns offset-by-ten columns" disabled={state.submitting}
                    // onClick={(e) => {
                    //     e.preventDefault();
                    //     e.stopPropagation();
                    //     handleSubmit();
                    // }}
                />
            </form>
        </div>
    );
}
