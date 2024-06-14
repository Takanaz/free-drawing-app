"use client";

import { useState, useEffect, useRef } from "react";

import Konva from "konva";
import { Stage, Layer, Line } from "react-konva";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import DownloadIcon from "@mui/icons-material/Download";
import LineWeightIcon from "@mui/icons-material/LineWeight";
import RefreshIcon from "@mui/icons-material/Refresh";
import UndoIcon from "@mui/icons-material/Undo";
import { LuPencil, LuEraser, LuPalette } from "react-icons/lu";

import "./style.css";

const FreeDrawingComponent = () => {
  const [tool, setTool] = useState("pen");
  const [lines, setLines] = useState<any[]>([]);
  const isDrawing = useRef(false);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const position = e.target.getStage().getPointerPosition();
    setLines([
      ...lines,
      {
        tool,
        points: [position.x, position.y],
        color: color.hex,
        strokeWidth: lineWeight,
      },
    ]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) {
      return;
    }
    const position = e.target.getStage().getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([position.x, position.y]);

    lines.splice(lines.length - 1, 1, lastLine);
    setLines([...lines]);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleTouchStart = (e: any) => {
    e.evt.preventDefault();
    const point = e.target.getStage().getPointerPosition();
    setLines([
      ...lines,
      {
        tool,
        points: [point.x, point.y],
        color: color.hex,
        strokeWidth: lineWeight,
      },
    ]);
    isDrawing.current = true;
  };

  const handleTouchMove = (e: any) => {
    e.evt.preventDefault();
    if (!isDrawing.current) {
      return;
    }
    const point = e.target.getStage().getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines([...lines]);
  };

  const handleTouchEnd = (e: any) => {
    e.evt.preventDefault();
    isDrawing.current = false;
  };

  const handleUndo = () => {
    setLines(lines.slice(0, lines.length - 1));
    setIsDisplayColorPicker(false);
  };

  const onClickChangeTool = (tool: string) => {
    setTool(tool);
    setIsDisplayColorPicker(false);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpenMenuItems = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setIsDisplayColorPicker(false);
  };
  const handleCloseMenuItems = () => {
    setAnchorEl(null);
  };

  const [lineWeight, setLineWeight] = useState(5);
  const handleChangeLineWeight = (weight: number) => {
    handleCloseMenuItems();
    setLineWeight(weight);
  };

  const [color, setColor] = useColor("#000000");
  const [isDisplayColorPicker, setIsDisplayColorPicker] = useState(false);
  const onClickDisplayColorPicker = () => {
    setIsDisplayColorPicker(!isDisplayColorPicker);
  };
  useEffect(() => {
    setColor(color);
  }, [color]);

  const onClickResetCanvas = () => {
    setLines([]);
    setIsDisplayColorPicker(false);
  };

  const stageRef = useRef<Konva.Stage>(null);
  const onClickDownloadCanvas = () => {
    if (stageRef.current) {
      const a = document.createElement("a");
      a.href = stageRef.current.toCanvas().toDataURL();
      a.download = "canvas.png";
      a.click();
    }
    setIsDisplayColorPicker(false);
  };

  return (
    <div className="free-drawing-container">
      <Stage
        style={{ border: "1px solid black", borderRadius: "32px" }}
        width={window.innerWidth * 0.6}
        height={window.innerHeight * 0.6}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={stageRef}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
        </Layer>
      </Stage>
      <div className="toolbar">
        <Tooltip title="戻す" placement="top">
          <IconButton onClick={handleUndo}>
            <UndoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="ペン" placement="top">
          <IconButton
            onClick={() => onClickChangeTool("pen")}
            color={tool === "pen" ? "primary" : "default"}
          >
            <LuPencil />
          </IconButton>
        </Tooltip>
        <Tooltip title="消しゴム" placement="top">
          <IconButton
            onClick={() => onClickChangeTool("eraser")}
            color={tool === "eraser" ? "primary" : "default"}
          >
            <LuEraser />
          </IconButton>
        </Tooltip>
        <Tooltip title="ペン / 消しゴムの太さ" placement="top">
          <IconButton
            id="line-weight-button"
            aria-controls={open ? "line-weight-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleOpenMenuItems}
            color={anchorEl ? "primary" : "default"}
          >
            <LineWeightIcon />
          </IconButton>
        </Tooltip>
        <Menu
          id="line-weight-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseMenuItems}
          MenuListProps={{
            "aria-labelledby": "line-weight-button",
            style: {
              display: "flex",
              flexDirection: "row",
            },
          }}
          className="menu-list"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((weight) => (
            <MenuItem
              key={weight}
              onClick={() => handleChangeLineWeight(weight)}
            >
              {weight}
            </MenuItem>
          ))}
        </Menu>
        <Tooltip title="ペンの色" placement="top">
          <IconButton
            onClick={onClickDisplayColorPicker}
            color={isDisplayColorPicker ? "primary" : "default"}
          >
            <LuPalette />
          </IconButton>
        </Tooltip>
        <Tooltip title="描画のリセット" placement="top">
          <IconButton onClick={onClickResetCanvas}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="ダウンロード" placement="top">
          <IconButton onClick={onClickDownloadCanvas}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </div>
      <div className="tool-info">
        <Typography>
          現在のツール：{tool === "pen" ? "ペン" : "消しゴム"}
        </Typography>
        <Typography>ツールの太さ：{lineWeight}</Typography>
        {tool === "pen" && (
          <Typography style={{ display: "flex", alignItems: "center" }}>
            ペンの色：
            <Box
              sx={{
                width: "14px",
                height: "14px",
                backgroundColor: color.hex,
                border: "1px solid black",
                marginRight: "4px",
              }}
            />
            {color.hex}
          </Typography>
        )}
      </div>
      <div style={{ display: isDisplayColorPicker ? "block" : "none" }}>
        <ColorPicker
          hideInput={["rgb", "hsv"]}
          color={color}
          onChange={setColor}
        />
      </div>
    </div>
  );
};

export default FreeDrawingComponent;
