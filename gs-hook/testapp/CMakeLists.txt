cmake_minimum_required(VERSION 3.20)
project(gdi-texttest CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# App GUI Win32 (entry point wWinMain).
add_executable(gdi-texttest WIN32 gdi_text_test.cpp)

target_link_libraries(gdi-texttest PRIVATE user32 gdi32)

set_target_properties(gdi-texttest PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin")
