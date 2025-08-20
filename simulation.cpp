// simulation.cpp
// Cosmic simulation calculations for Zain Malik's portfolio
// This would be compiled and run on a server, with output consumed by the frontend

#include <iostream>
#include <vector>
#include <cmath>
#include <json.hpp> // Would require a JSON library for output

using json = nlohmann::json; // Assuming using nlohmann/json library

// Structure to hold star data
struct Star {
    double x, y;
    double size;
    double speed;
};

// Structure to hold orbital data
struct Orbit {
    double centerX, centerY;
    double radius;
    double speed;
};

// Function to simulate star positions
std::vector<Star> simulateStars(int count) {
    std::vector<Star> stars;
    
    for (int i = 0; i < count; i++) {
        Star star;
        star.x = rand() % 800; // Random position
        star.y = rand() % 600;
        star.size = 1 + (rand() % 4); // Random size between 1-4
        star.speed = 0.1 + (rand() % 100) / 100.0; // Random speed
        
        stars.push_back(star);
    }
    
    return stars;
}

// Function to generate orbital paths
std::vector<Orbit> generateOrbits(int count) {
    std::vector<Orbit> orbits;
    
    for (int i = 0; i < count; i++) {
        Orbit orbit;
        orbit.centerX = 400; // Center of screen
        orbit.centerY = 300;
        orbit.radius = 50 + (i * 50); // Increasing radius
        orbit.speed = 0.01 + (i * 0.01); // Increasing speed
        
        orbits.push_back(orbit);
    }
    
    return orbits;
}

int main() {
    // Simulate cosmic data
    std::vector<Star> stars = simulateStars(150);
    std::vector<Orbit> orbits = generateOrbits(3);
    
    // Create JSON output
    json output;
    output["stars"] = stars;
    output["orbits"] = orbits;
    
    // Output JSON for frontend consumption
    std::cout << output.dump() << std::endl;
    
    return 0;
}
