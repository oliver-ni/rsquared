import useComponentSize from "@rehooks/component-size";
import "bulma/css/bulma.min.css";
import React, { useRef } from "react";
import { Circle, Layer, Line, Stage } from "react-konva";
import { animated, interpolate, useSpring, useSprings } from "react-spring";
import "./App.css";
import { usePoints } from "./hooks";

const AnimatedCircle = animated(Circle);
const AnimatedLine = animated(Line);

const Colors = {
    POINT: "#e13f3f",
    LINE: "#3b60ff",
    GRID: "#c5c5c5",
    RESID: "#757575",
};

const Canvas = ({
    points,
    addPoint,
    removePoint,
    allowAdd,
    stats,
    ...props
}) => {
    let ref = useRef(null);
    let { width: w, height: h } = useComponentSize(ref);

    const springs = useSprings(
        points.length,
        points.map((p) => ({ x: p[0], y: p[1] }))
    );

    const { mx, my, b1, b0 } = useSpring({
        mx: stats[0],
        my: stats[1],
        b1: stats[2],
        b0: stats[3],
    });

    return (
        <div className="points-container" ref={ref}>
            <Stage
                width={w}
                height={h}
                onClick={allowAdd ? addPoint : undefined}
                {...props}
            >
                <Layer>
                    <AnimatedLine
                        points={interpolate([mx], (mx) => [mx, 0, mx, h])}
                        stroke={Colors.GRID}
                    />
                    <AnimatedLine
                        points={interpolate([my], (my) => [0, my, w, my])}
                        stroke={Colors.GRID}
                    />

                    {springs.map(({ x, y }, idx) => (
                        <AnimatedLine
                            points={interpolate(
                                [x, y, b1, b0],
                                (x, y, b1, b0) => [x, y, x, b1 * x + b0]
                            )}
                            stroke={Colors.RESID}
                            key={idx}
                        />
                    ))}

                    <AnimatedLine
                        points={interpolate([b0, b1], (b0, b1) => [
                            0,
                            b0,
                            w,
                            b1 * w + b0,
                        ])}
                        stroke={Colors.LINE}
                    />

                    {springs.map(({ x, y }, idx) => (
                        <AnimatedCircle
                            x={x}
                            y={y}
                            radius={8}
                            fill={Colors.POINT}
                            key={idx}
                            onClick={() => removePoint(idx)}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
};

const App = () => {
    const {
        points,
        stats,
        showResids,
        addPoint,
        removePoint,
        setShowResids,
    } = usePoints();

    const style = useSpring({
        backgroundColor: showResids ? "#eeeeee" : "#ffffff",
        cursor: showResids ? "not-allowed" : "initial",
    });

    return (
        <div className="all-wrapper">
            <animated.div className="box points-wrapper">
                <div class="tabs is-centered mb-0">
                    <ul>
                        <li className={showResids ? "" : "is-active"}>
                            <a onClick={() => setShowResids(false)}>
                                <span>Points</span>
                            </a>
                        </li>
                        <li className={showResids ? "is-active" : ""}>
                            <a onClick={() => setShowResids(true)}>
                                <span>Residuals</span>
                            </a>
                        </li>
                    </ul>
                </div>
                <Canvas
                    points={points}
                    addPoint={addPoint}
                    removePoint={removePoint}
                    allowAdd={!showResids}
                    stats={stats}
                    style={style}
                />
            </animated.div>
        </div>
    );
};

export default App;
