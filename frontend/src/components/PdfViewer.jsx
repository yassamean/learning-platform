import { useRef, useState, useEffect } from "react";
import {
  Button,
  Tooltip,
  Position,
  Viewer,
  Worker,
} from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { highlightPlugin, MessageIcon } from "@react-pdf-viewer/highlight";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { PencilIcon, XCircleIcon } from "@heroicons/react/24/outline";

const PdfViewer = ({
  pdfUrl,
  highlightedText,
  setHighlightedText,
  userInteraction,
  setUserInteraction,
}) => {
  const notesContainerRef = useRef(null);
  let noteId = highlightedText.length;
  const noteEles = new Map();

  const renderHighlightTarget = (props) => (
    <div
      style={{
        background: "#eee",
        display: "flex",
        position: "absolute",
        left: `${props.selectionRegion.left}%`,
        top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
        height: "31px",
        transform: "translate(0, 8px)",
        zIndex: 1,
      }}
    >
      <Tooltip
        position={Position.TopCenter}
        target={
          <Button onClick={() => addNote(props)} style={{ height: 0 }}>
            <PencilIcon className="size-5"></PencilIcon>
          </Button>
        }
        content={() => <div style={{ width: "150px" }}>Highlight Text</div>}
        offset={{ left: 0, top: -8 }}
      />
    </div>
  );

  const addNote = (props) => {
    if (props.selectedText !== "") {
      const note = {
        id: ++noteId,
        highlightAreas: props.highlightAreas,
        quote: props.selectedText,
      };
      setHighlightedText([...highlightedText, note]);
      !userInteraction && setUserInteraction(true);
      props.cancel();
    }
  };

  const renderHighlights = (props) => (
    <div>
      {highlightedText.map((note, index) => (
        <div key={index}>
          {note.highlightAreas
            .filter((area) => area.pageIndex === props.pageIndex)
            .map((area, idx) => (
              <div
                key={idx}
                style={Object.assign(
                  {},
                  {
                    background: "yellow",
                    opacity: 0.4,
                  },
                  props.getCssProperties(area, props.rotation)
                )}
              />
            ))}
        </div>
      ))}
    </div>
  );

  const highlightPluginInstance = highlightPlugin({
    renderHighlightTarget,
    renderHighlights,
  });

  const { jumpToHighlightArea } = highlightPluginInstance;

  const deleteHighlight = (index) => {
    setHighlightedText(highlightedText.filter((elmt, idx) => idx !== index));
    !userInteraction && setUserInteraction(true);
  };

  const sidebarNotes = (
    <div
      ref={notesContainerRef}
      style={{
        overflow: "auto",
        width: "100%",
      }}
    >
      {highlightedText.length === 0 && (
        <div style={{ textAlign: "center" }}>There is no note</div>
      )}
      {highlightedText.map((note, index) => {
        return (
          <div
            key={index}
            style={{
              borderBottom: "1px solid rgba(0, 0, 0, .3)",
              cursor: "pointer",
              padding: "8px",
            }}
            className="flex justify-between "
            onClick={() => jumpToHighlightArea(note.highlightAreas[0])}
            ref={(ref) => {
              noteEles.set(index, ref);
            }}
          >
            <blockquote
              style={{
                borderLeft: "2px solid rgba(0, 0, 0, 0.2)",
                fontSize: ".75rem",
                lineHeight: 1.5,
                paddingLeft: "8px",
                textAlign: "justify",
              }}
            >
              {note.quote}
            </blockquote>
            <button>
              <XCircleIcon
                className="size-4 hover:text-red-600"
                onClick={() => deleteHighlight(index)}
              ></XCircleIcon>
            </button>
          </div>
        );
      })}
    </div>
  );

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      {
        content: sidebarNotes,
        icon: <PencilIcon className="size-5" />,
        title: "Highlighted Text",
      },
    ],
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const {
            CurrentPageInput,
            GoToNextPage,
            GoToPreviousPage,
            NumberOfPages,
            ShowSearchPopover,
            Zoom,
            ZoomIn,
            ZoomOut,
          } = slots;
          return (
            <div className="flex items-center w-full justify-between">
              <div>
                <ShowSearchPopover />
              </div>
              <div className="flex">
                <ZoomOut />
                <Zoom />
                <ZoomIn />
              </div>
              <div className="flex items-center">
                <GoToPreviousPage />
                <div className="flex items-center">
                  <CurrentPageInput />
                  <span>/</span>
                  <NumberOfPages />
                </div>
                <GoToNextPage />
              </div>
            </div>
          );
        }}
      </Toolbar>
    ),
  });

  return (
    <Worker workerUrl="/pdf-worker/pdf.worker.min.js">
      <Viewer
        theme={{
          theme: localStorage.getItem("darkMode") === "true" ? "dark" : "light",
        }}
        fileUrl={pdfUrl}
        plugins={[highlightPluginInstance, defaultLayoutPluginInstance]}
      />
    </Worker>
  );
};

export default PdfViewer;
