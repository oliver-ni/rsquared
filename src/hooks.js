import { useEffect, useState } from "react";
import regression from "regression";

export const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        w: window.innerWidth,
        h: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                w: window.innerWidth,
                h: window.innerHeight,
            });
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
};

const getStats = (points) => {
    if (points.length === 0) return [-1, -1, 0, -1];

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

export const usePoints = () => {
    const [points, _setPoints] = useState([]);
    const [stats, setStats] = useState(getStats(points));
    const [showResids, setShowResids] = useState(false);

    const [, my, b1, b0] = stats;

    const resid = points.map(([x, y]) => [x, y - b1 * x - b0 + my]);
    const residStats = getStats(resid);

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

    const toggleResids = () => setShowResids(!showResids);

    return {
        addPoint,
        removePoint,
        setPoints,
        setShowResids,
        toggleResids,
        showResids,
        points: showResids ? resid : points,
        stats: showResids ? residStats : stats,
    };
};
