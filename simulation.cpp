// simulation.cpp
// Cosmic simulation calculations for Zain Malik's portfolio
// This would be compiled and run on a server, with output consumed by the frontend

#include <iostream>
#include <vector>
#include <cmath>
#include <random>
#include <chrono>
#include <thread>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

// Structure to hold star data
struct Star {
    double x, y;
    double size;
    double speed;
    double angle;
};

// Structure to hold orbital data
struct Orbit {
    double centerX, centerY;
    double radius;
    double speed;
};

// Function to simulate star positions with more complex behavior
std::vector<Star> simulateStars(int count) {
    std::vector<Star> stars;
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<> posDist(0, 800);
    std::uniform_real_distribution<> sizeDist(1.0, 4.0);
    std::uniform_real_distribution<> speedDist(0.1, 1.0);
    std::uniform_real_distribution<> angleDist(0, 2 * M_PI);
    
    for (int i = 0; i < count; i++) {
        Star star;
        star.x = posDist(gen);
        star.y = posDist(gen);
        star.size = sizeDist(gen);
        star.speed = speedDist(gen);
        star.angle = angleDist(gen);
        
        stars.push_back(star);
    }
    
    return stars;
}

// Function to generate orbital paths with realistic physics
std::vector<Orbit> generateOrbits(int count) {
    std::vector<Orbit> orbits;
    
    for (int i = 0; i < count; i++) {
        Orbit orbit;
        orbit.centerX = 400;
        orbit.centerY = 300;
        orbit.radius = 50 + (i * 50);
        
        // Simulate Kepler's third law: orbital period ∝ orbital radius^(3/2)
        orbit.speed = 0.5 / std::pow(orbit.radius, 1.5);
        
        orbits.push_back(orbit);
    }
    
    return orbits;
}

// Function to update star positions based on physics simulation
void updateStars(std::vector<Star>& stars, double deltaTime) {
    for (auto& star : stars) {
        // Move stars in their direction with their speed
        star.x += std::cos(star.angle) * star.speed * deltaTime;
        star.y += std::sin(star.angle) * star.speed * deltaTime;
        
        // Bounce off edges
        if (star.x < 0 || star.x > 800) {
            star.angle = M_PI - star.angle;
            star.x = std::max(0.0, std::min(800.0, star.x));
        }
        if (star.y < 0 || star.y > 600) {
            star.angle = -star.angle;
            star.y = std::max(0.0, std::min(600.0, star.y));
        }
        
        // Add some random motion
        std::random_device rd;
        std::mt19937 gen(rd());
        std::normal_distribution<> angleChange(0, 0.05);
        star.angle += angleChange(gen);
    }
}

int main() {
    // Simulate cosmic data
    std::vector<Star> stars = simulateStars(150);
    std::vector<Orbit> orbits = generateOrbits(3);
    
    // Simulation loop
    auto lastTime = std::chrono::high_resolution_clock::now();
    while (true) {
        auto currentTime = std::chrono::high_resolution_clock::now();
        double deltaTime = std::chrono::duration<double>(currentTime - lastTime).count();
        lastTime = currentTime;
        
        // Update star positions
        updateStars(stars, deltaTime * 10); // Scale for visual effect
        
        // Create JSON output
        json output;
        output["stars"] = stars;
        output["orbits"] = orbits;
        output["timestamp"] = std::chrono::system_clock::now().time_since_epoch().count();
        
        // Output JSON for frontend consumption
        std::cout << output.dump() << std::endl;
        
        // Sleep to control update rate
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
    
    return 0;
}
