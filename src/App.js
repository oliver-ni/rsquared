import React, { useState } from "react";
import { Circle, Layer, Line, Stage } from "react-konva";
import { animated, interpolate, useSpring, useSprings } from "react-spring";
import regression from "regression";
import "./App.css";

const AnimatedCircle = animated(Circle);
const AnimatedLine = animated(Line);

const Colors = {
    POINT: "#e13f3f",
    LINE: "#3b60ff",
    GRID: "#c5c5c5",
    RESID: "#222222",
};

const getStats = (points) => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (points.length === 0) return [w / 2, h / 2, 0, h / 2];

    const result = regression.linear(points);
    const b1 = result.equation[0];
    const b0 = result.equation[1];

    const [sx, sy] = points.reduce(([sx, sy], [x, y]) => [sx + x, sy + y], [
        0,
        0,
    ]);
    const [mx, my] = [sx / points.length, sy / points.length];

    return [mx, my, b1, b0];
};

const usePoints = () => {
    const [points, _setPoints] = useState([]);
    const [stats, setStats] = useState(getStats(points));

    const setPoints = (newPoints) => {
        _setPoints(newPoints);
        setStats(getStats(newPoints));
    };

    const addPoint = (e) => {
        if (e.target !== e.target.getStage()) {
            return;
        }
        setPoints([...points, [e.evt.layerX, e.evt.layerY]]);
    };

    const removePoint = (idx) => {
        const newPoints = [...points];
        newPoints.splice(idx, 1);
        setPoints(newPoints);
    };

    return [points, addPoint, removePoint, setPoints, stats];
};

const App = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const [
        points,
        addPoint,
        removePoint,
        setPoints,
        [mx, my, b1, b0],
    ] = usePoints();

    const springs = useSprings(
        points.length,
        points.map((p) => ({ x: p[0], y: p[1] }))
    );

    const reg = useSpring({ mx, my, b1, b0 });

    return (
        <div>
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                onClick={addPoint}
            >
                <Layer>
                    <AnimatedLine
                        points={reg.mx.interpolate((mx) => [mx, 0, mx, h])}
                        stroke={Colors.GRID}
                    />
                    <AnimatedLine
                        points={reg.my.interpolate((my) => [0, my, w, my])}
                        stroke={Colors.GRID}
                    />
                    <AnimatedLine
                        points={interpolate([reg.b0, reg.b1], (b0, b1) => [
                            0,
                            b0,
                            w,
                            b1 * w + b0,
                        ])}
                        stroke={Colors.LINE}
                    />

                    {springs.map(({ x, y }, idx) => (
                        <AnimatedLine
                            points={interpolate(
                                [x, y, reg.b1, reg.b0],
                                (x, y, b1, b0) => [x, y, x, b1 * x + b0]
                            )}
                            stroke={Colors.RESID}
                            strokeWidth={1}
                            key={idx}
                        />
                    ))}

                    {springs.map(({ x, y }, idx) => (
                        <AnimatedCircle
                            x={x}
                            y={y}
                            radius={8}
                            fill={Colors.POINT}
                            key={idx}
                            onClick={removePoint.bind(null, idx)}
                        />
                    ))}
                </Layer>
            </Stage>
            {/* <button onClick={() => setPoints(points.map((p) => [p[0], 0]))}>
                test
            </button> */}
        </div>
    );
};

export default App;
