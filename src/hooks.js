import { useState } from "react";
import regression from "regression";

const initialStats = { mx: 0, my: 0, sx: 0, sy: 0, b0: 0, b1: 0, r2: 0 };

const mean = (data) => {
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
};

const stdev = (data) => {
    const avg = mean(data);

    const squareDiffs = data.map((val) => {
        var diff = val - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
    });

    const variance = mean(squareDiffs);
    const stdDev = Math.sqrt(variance);

    return stdDev;
};

const getStats = (points) => {
    if (points.length === 0) return initialStats;

    const result = regression.linear(points);
    const b1 = result.equation[0];
    const b0 = result.equation[1];
    const r2 = isNaN(result.r2) ? 0 : result.r2;

    const mx = mean(points.map((p) => p[0]));
    const my = mean(points.map((p) => p[1]));

    const sx = stdev(points.map((p) => p[0]));
    const sy = stdev(points.map((p) => p[1]));

    return { mx, my, sx, sy, b0, b1, r2 };
};

export const usePoints = () => {
    const [points, _setPoints] = useState([]);
    const [stats, setStats] = useState(getStats(points));
    const [showResids, setShowResids] = useState(false);

    const { b0, b1 } = stats;

    const resids = points.map(([x, y]) => [x, y - b1 * x - b0]);
    const residStats = getStats(resids);

    const setPoints = (newPoints) => {
        _setPoints(newPoints);
        setStats(getStats(newPoints));
    };

    const addPoint = (x, y) => {
        setPoints([...points, [x, y]]);
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
        points: showResids ? resids : points,
        stats: showResids ? residStats : stats,
    };
};
