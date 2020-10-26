/* eslint jsx-a11y/anchor-is-valid: 0 */

import useComponentSize from "@rehooks/component-size";
import "bulma/css/bulma.min.css";
import React, { useRef } from "react";
import { Circle, Layer, Line, Stage, Text } from "react-konva";
import { animated, interpolate, useSpring, useSprings } from "react-spring";
import "./App.css";
import { usePoints } from "./hooks";

const AnimatedCircle = animated(Circle);
const AnimatedLine = animated(Line);
const AnimatedText = animated(Text);

const Colors = {
    POINT: "#e13f3f",
    LINE: "#3b60ff",
    GRID: "#c5c5c5",
    RESID: "#757575",
};

const textProps = {
    fontFamily:
        'BlinkMacSystemFont,-apple-system,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",Helvetica,Arial,sans-serif',
    fontSize: 16,
    padding: 16,
};

const round = (x) => x.toFixed(2);

const Canvas = ({
    points,
    addPoint: _addPoint,
    removePoint,
    allowEdit,
    stats,
    ...props
}) => {
    let ref = useRef(null);
    let { width: w, height: h } = useComponentSize(ref);

    const springs = useSprings(
        points.length,
        points.map((p) => ({ x: p[0], y: p[1] }))
    );

    const { mx, my, b1, b0, r2 } = stats;

    const addPoint = (e) => {
        if (e.target.attrs.fill === Colors.POINT) return;
        _addPoint(e.evt.layerX - w / 2, e.evt.layerY - h / 2);
    };

    return (
        <animated.div className="points-container" ref={ref} {...props}>
            <Stage
                width={w}
                height={h}
                onClick={allowEdit ? addPoint : undefined}
            >
                {points.length === 0 ? (
                    <Layer>
                        <Text
                            {...textProps}
                            width={w}
                            height={h}
                            align="center"
                            verticalAlign="middle"
                            text={
                                allowEdit
                                    ? "Click to add points"
                                    : "No points to display."
                            }
                        />
                    </Layer>
                ) : (
                    <Layer offsetX={-w / 2} offsetY={-h / 2}>
                        <AnimatedText
                            {...textProps}
                            x={-w / 2}
                            y={-h / 2}
                            width={w}
                            height={h}
                            align="right"
                            verticalAlign="bottom"
                            text={r2.interpolate((r2) => `R² = ${round(r2)}`)}
                        />

                        <AnimatedLine
                            points={mx.interpolate((mx) => [
                                mx,
                                -h / 2,
                                mx,
                                h / 2,
                            ])}
                            stroke={Colors.GRID}
                        />
                        <AnimatedLine
                            points={my.interpolate((my) => [
                                -w / 2,
                                my,
                                w / 2,
                                my,
                            ])}
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
                                -w / 2,
                                b1 * (-w / 2) + b0,
                                w / 2,
                                b1 * (w / 2) + b0,
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
                                onClick={
                                    allowEdit
                                        ? removePoint.bind(null, idx)
                                        : undefined
                                }
                            />
                        ))}
                    </Layer>
                )}
            </Stage>
        </animated.div>
    );
};

const Histogram = ({ w, h, points }) => {
    const numBars = Math.ceil(h / 50);

    const bars = points.reduce((acc, [, yr]) => {
        const y = yr + h / 2;
        acc[Math.floor(y / 50)] += 1;
        return acc;
    }, Array(numBars).fill(0));

    const barHeight = Math.min(40, ...bars.map((n) => w / (n + 2)));

    const springs = useSprings(
        numBars,
        bars.map((x) => ({
            width: x * barHeight,
        }))
    );

    return (
        <div className="histogram-container">
            {springs.map((style, idx) => (
                <animated.div key={idx} style={style}></animated.div>
            ))}
        </div>
    );
};

const Control = ({ points, stats }) => {
    let ref = useRef(null);
    let { width: w, height: h } = useComponentSize(ref);
    const { my, sy } = stats;

    const h2 = h / 2;

    return (
        <div className="control-container" ref={ref}>
            {points.length >= 2 && (
                <animated.div
                    className="stdev-bar"
                    style={{
                        top: interpolate(
                            [my, sy],
                            (my, sy) => h2 + my - sy / 2
                        ),
                        bottom: interpolate(
                            [my, sy],
                            (my, sy) => h2 - my - sy / 2
                        ),
                    }}
                >
                    <span>STDEV</span>
                </animated.div>
            )}
            <Histogram points={points} w={w} h={h} />
        </div>
    );
};

const App = () => {
    const {
        points,
        showResids,
        addPoint,
        removePoint,
        setShowResids,
        stats: _stats,
    } = usePoints();

    const style = useSpring({
        backgroundColor: showResids ? "#eeeeee" : "#ffffff",
        cursor: showResids ? "not-allowed" : "crosshair",
    });

    const stats = useSpring(_stats);

    return (
        <div className="all-wrapper">
            <div className="section">
                <p className="title">
                    R<sup>2</sup> Visualizer
                </p>
            </div>
            <div className="box all-container">
                <div className="tabs is-centered mb-0">
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
                <div className="columns is-gapless is-mobile">
                    <div className="column is-3">
                        <Control points={points} stats={stats} />
                    </div>
                    <div className="column">
                        <Canvas
                            points={points}
                            addPoint={addPoint}
                            removePoint={removePoint}
                            allowEdit={!showResids}
                            stats={stats}
                            style={style}
                        />
                    </div>
                </div>
            </div>
            <div className="section foot container">
                <div className="content has-text-centered">
                    <p>
                        <strong>
                            R<sup>2</sup> Visualizer
                        </strong>{" "}
                        by <a href="https://oliverni.com/">Oliver Ni</a>.{" "}
                        <a href="https://github.com/oliver-ni/rsquared">
                            View on GitHub.
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default App;
