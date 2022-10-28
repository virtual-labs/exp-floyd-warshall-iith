'use strict';
import { graph, makeGraph, states, numEdges, numNodes } from "./randomGraph.js";
import { addEdges, cy } from "./displayGraph.js";
import { showInfo } from "./helper.js";
import {removeEdges} from "./showEdges.js";
window.nextSimulation = nextSimulation;
window.previousSimulation = previousSimulation;
window.restartSimulation = restartSimulation;
window.showInfo = showInfo;
window.refreshWorkingArea = refreshWorkingArea;

const observ = document.getElementById("observations");
const EMPTY = "";

export const connectionMap = new Map();
export let componentsList = [];
let pointer = 0;
let decide = true;
let stateKeys = [];

function updateDistanceTable(distance) {
    for (let i = 1; i <= numNodes; i++) {
        for (let j = 1; j <= numNodes; j++) {
            if (distance[i - 1][j - 1] < 1e5) {
                document.getElementById("dist" + i.toString() + j.toString() + "text").innerHTML = distance[i - 1][j - 1];
            }else{
                document.getElementById("dist" + i.toString() + j.toString() + "text").innerHTML = "∞";
            }
        }
    }
}


function statesLabel() {
    for (let i = 0; i < numNodes; i++) {
        for (let j = 0; j < numNodes; j++) {
            for (let k = 0; k < numNodes; k++) {
                if (i !== j && j !== k && i !== k) {
                    const key = j.toString() + "-" + k.toString() + "-" + i.toString();
                    stateKeys.push(key);
                }
            }
        }
    }
}

export function fillStates() {
    console.log(graph);
    statesLabel();
    // floyd warshall algorithm
    let dist = new Array(numNodes);
    for (let i = 0; i < numNodes; i++) {
        dist[i] = new Array(numNodes);
        for (let j = 0; j < numNodes; j++) {
            dist[i][j] = 1000000;
        }
        dist[i][i] = 0;
    }
    for (let edge of graph) {
        let src = edge.source - 1;
        let dest = edge.target - 1;
        dist[src][dest] = edge.weight;
    }
    updateDistanceTable(dist);
    for (let k = 0; k < numNodes; k++) {
        for (let i = 0; i < numNodes; i++) {
            for (let j = 0; j < numNodes; j++) {
                if (i !== j && j !== k && i !== k) {
                    const key = i.toString() + "-" + j.toString() + "-" + k.toString();
                    let tempState = {};
                    if (dist[i][k] + dist[k][j] < dist[i][j] && dist[i][k]+dist[k][j] < 1e5) {
                        tempState["change"] = true;
                        dist[i][j] = dist[i][k] + dist[k][j];
                    } else {
                        tempState["change"] = false;
                    }
                    tempState["distance"] = [];
                    for (let i = 0; i < numNodes; i++) {
                        tempState["distance"].push(dist[i].slice());
                    }
                    states[key] = tempState;
                }
            }
        }
    }
}

function restoreColor(arrayColor, nodeColor) {
    cy.nodes().style('background-color', nodeColor);
    for (let i = 1; i <= numNodes; i++) {
        for (let j = 1; j <= numNodes; j++) {
            document.getElementById("dist"+i.toString()+j.toString()).style.fill= arrayColor;
        }
    }
}

function changeColor(src, middle, dest, middleColor) {
    cy.nodes('[id = "' + src + '"]').style('background-color', "violet");
    cy.nodes('[id = "' + middle + '"]').style('background-color', middleColor);
    cy.nodes('[id = "' + dest + '"]').style('background-color', "orange");
    document.getElementById("dist" + src.toString() + dest.toString()).style.fill= middleColor;
}

function showCurrentIteration(node) {
    for (let iter = 1; iter <= numNodes; iter++) {
        document.getElementById("iteration" + iter.toString()).classList.remove("is-active")
    }
    document.getElementById("iteration" + node.toString()).classList.add("is-active")
}

function run(key) {
    restoreColor("rgb(34, 153, 238)", "pink");
    console.log(key, states[key]);
    let state = states[key];
    let distance = state["distance"];
    let src = parseInt(key.split("-")[0]) + 1;
    let dest = parseInt(key.split("-")[1]) + 1;
    let middle = parseInt(key.split("-")[2]) + 1;
    showCurrentIteration(middle);
    if (state["change"]) {
        observ.innerHTML = "The distance between the nodes " + src + " and " + dest + " is greater than the distance between the nodes " + src + " and " + middle + " plus the distance between the nodes " + middle + " and " + dest + ". So, the distance between the nodes " + src + " and " + dest + " is updated to " + distance[src - 1][middle - 1] + " + " + distance[middle - 1][dest - 1] + " = " + distance[src - 1][dest - 1] + ".";
        changeColor(src, middle, dest, "red");
    } else {
        observ.innerHTML = "The distance between the nodes " + src + " and " + dest + " is less than the distance between the nodes " + src + " and " + middle + " plus the distance between the nodes " + middle + " and " + dest + ". So, the distance between the nodes " + src + " and " + dest + " remains unchanged.";
        changeColor(src, middle, dest, "yellow");
    }
    updateDistanceTable(distance);
}

export function restartSimulation() {
    for (let iter = 1; iter <= numNodes; iter++) {
        document.getElementById("iteration" + iter.toString()).classList.remove("is-active")
    }
    pointer = 0;
    decide = true;
    stateKeys = [];
    removeEdges();
    observ.innerHTML = EMPTY;
    restoreColor("rgb(34, 153, 238)", "pink");
    refreshWorkingArea();
}

export function nextSimulation() {
    if (decide) {
        run(stateKeys[pointer]);
        decide = false;
    }
    else {
        if (pointer < stateKeys.length - 1) {
            pointer++;
            run(stateKeys[pointer]);
        }
        else {
            observ.innerHTML = "The simulation is finished";
        }
    }
}

export function previousSimulation() {

    // to check if the last simulation was next or previous
    if (decide) {
        observ.innerHTML = "Cannot go back";
    }
    else {
        if (pointer > 0) {
            pointer--;
            run(stateKeys[pointer]);
        }
        else {
            observ.innerHTML = "Cannot go back";
        }
    }
}

export function refreshWorkingArea() {
    makeGraph();
    addEdges();
    fillStates();
}
refreshWorkingArea();