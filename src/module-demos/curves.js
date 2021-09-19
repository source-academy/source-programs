// Curves: A "curves" library for drawing curves with functional programming

// copy this program into the Source Academy playground
// https://sourceacademy.nus.edu.sg/playground

// instructions: uncomment one of the draw_* lines
//               below and then press "Run"
//               (if necessary, adjust the size of REPL tab)
//               Click on the Curves Canvas tab spawned to view

// For full documentation of CURVES, see 
//                  https://sicp.comp.nus.edu.sg/source/CURVES/

import {
    make_3D_point,
    make_color_point,
    make_3D_color_point,
    draw_connected_full_view,
    draw_points_full_view_proportional,
    draw_3D_connected_full_view,
    draw_3D_points_full_view_proportional,
    unit_circle,
    connect_ends,
    translate,
    scale,
    rotate_around_origin
} from "curves";

const colored_unit_circle = t => make_color_point(
    0.5 * math_cos(2 * math_PI * t) + 0.5,             // x-coordinate
    0.5 * math_sin(2 * math_PI * (t + 0.5)) + 0.5,     // y-coordinate
    math_pow(math_cos(2 * math_PI * t), 2) * 255,      // r-component
    math_pow(math_sin(2 * math_PI * t), 2) * 255,      // g-component
    t * 255);                                          // b-component

const spiral = t => make_3D_point(
    0.5 * math_cos(2 * math_PI * t) + 0.5,           // x-component
    0.5 * math_sin(2 * math_PI * (t + 0.5)) + 0.5,   // y-component
    t);                                              // z-component

const colored_spiral = t => make_3D_color_point(
    0.5 * math_cos(2 * math_PI * t) + 0.5,           // x-component
    0.5 * math_sin(2 * math_PI * (t + 0.5)) + 0.5,   // y-component
    t,                                               // z-component
    math_pow(math_cos(2 * math_PI * t), 2) * 255,    // r-component
    math_pow(math_sin(2 * math_PI * t), 2) * 255,    // g-component
    t * 255);                                        // b-component

const colored_spring = rotate_around_origin(0, math_PI/4, 0)(translate(2, 2, -2)
    (scale(7, 3, 2)
    (connect_ends(colored_unit_circle,
    connect_ends(colored_spiral, colored_unit_circle)))));

const to_domain = x => (2 * x - 1) * 100 * math_PI; // map to right domain

const heart_scale = (t, heart) => math_sin(math_PI * t) * heart; // x, y scaler

const heart = t => make_3D_color_point(
    t < 0.5 ? 30 * math_pow(t, 2) : 30 * (2 * math_pow(0.5, 2) - math_pow(1 - t, 2)),
    heart_scale(t, 16 * math_pow(math_sin(to_domain(t)), 3)),
    heart_scale(t, 13 * math_cos(to_domain(t)) - 5 * math_cos(2 * to_domain(t)) 
    - 2 * math_cos(3 * to_domain(t)) - math_cos(4 * to_domain(t))));

const colored_heart = t =>  make_3D_color_point(
    t < 0.5 ? 30 * math_pow(t, 2) : 30 * (2 * math_pow(0.5, 2) - math_pow(1 - t, 2)),
    heart_scale(t, 16 * math_pow(math_sin(to_domain(t)), 3)),
    heart_scale(t, 13 * math_cos(to_domain(t)) - 5 * math_cos(2 * to_domain(t)) 
    - 2 * math_cos(3 * to_domain(t)) - math_cos(4 * to_domain(t))),
    math_pow(math_cos(2 * math_PI * t), 2) * 255,   // r-component
    math_pow(math_sin(2 * math_PI * t), 2) * 255,   // g-component
    t * 255);                                       // b-component

// =============================================================================
// 2D Curves
//
// All drawings below here show 2D Curves, colored and non colored.
// =============================================================================

// Example of a circle with draw connected and points functions
// draw_connected_full_view(100)(unit_circle);
// draw_points_full_view_proportional(100)(unit_circle);

// Example of a colored circle with draw connected and points functions
// draw_connected_full_view(100)(colored_unit_circle);
// draw_points_full_view_proportional(100)(colored_unit_circle);



// =============================================================================
// 3D Curves
//
// All drawings below here show 3D Curves, colored and non colored.
// =============================================================================

// Example of spiral with draw connected and points functions
// draw_3D_connected_full_view(100)(spiral);
// draw_3D_points_full_view_proportional(100)(spiral);

// Example of colored spiral with draw connected and points functions
// draw_3D_connected_full_view(100)(colored_spiral);
// draw_3D_points_full_view_proportional(100)(colored_spiral);

// Example of colored spring with draw connected and points functions
// draw_3D_connected_full_view(500)(colored_spring);
// draw_3D_points_full_view_proportional(500)(colored_spring);

// Example of 
// draw_3D_points_full_view_proportional(60000)(heart);
draw_3D_points_full_view_proportional(60000)(colored_heart);
