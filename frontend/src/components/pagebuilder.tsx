import React from "react";
import { Spinner } from "reactstrap";
import PhoneComponent from "./PhoneComponent";
import DesktopComponent from "./DesktopComponent";

/**
 * Builds the page with the desktop/mobile compatible layouts. Must receive mobile/desktop friendly contents.
 * NOTE: Currently renders both mobile and desktop layouts. However, bootstrap handles which
 * layout needs to be shown using the d-{size}-{display} properties.
 * @param headerTitle The title that will be displayed in the top of the screen.
 * @param content The actual content of the body. Needs to be desktop/mobile friendly BEFORE
 *     it arrives here. Shows a spinner if Null.
 * @param sidebarContent The content for the sidebar. Needs to be desktop/mobile friendly BEFORE
 *     it arrives here. If null, does not show the sidebar.
 * @returns This returns both the desktop and phone components.
 */
export const buildContent = (
    headerTitle: string,
    content: JSX.Element | null,
    sidebarContent: JSX.Element | null = null,
    phoneBodyPaddingY: boolean = true,
    phoneBodyPaddingX: boolean = true,
): JSX.Element => {
    return (
        <div>
            <DesktopComponent
                headerTitle={headerTitle}
                content={content}
                sidebarContent={sidebarContent}
            />
            <PhoneComponent
                headerTitle={headerTitle}
                content={content}
                sidebarContent={sidebarContent}
                hasPaddingX={phoneBodyPaddingX}
                hasPaddingY={phoneBodyPaddingY}
            />
        </div>
    );
};

/**
 * Generates a Spinner, indicating that elements on the page have not yet loaded.
 * This Spinner will be displayed in the middle of the body, on both phone and desktop components.
 */
export const centerSpinner = (): JSX.Element => {
    return (
        <div className="d-flex justify-content-center h-100">
            <Spinner
                className="my-auto"
                style={{ width: "6rem", height: "6rem" }}
                type="grow"
                color="primary"
                role="status"
            />
        </div>
    );
};
