<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="Cafrezzo REST API",
 *     version="1.0.0",
 *     description="Backend REST API for Cafrezzo — premium coffee e-commerce platform. Supports product catalogue, orders, promos, tax, inventory and content management.",
 *     @OA\Contact(email="dev@cafrezzo.com"),
 *     @OA\License(name="MIT")
 * )
 *
 * @OA\Server(url=L5_SWAGGER_CONST_HOST, description="Local / Dev server")
 * @OA\Server(url="https://api.cafrezzo.com", description="Production server")
 *
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Use the token returned by /api/auth/login"
 * )
 *
 * @OA\Tag(name="Auth",       description="Register, login, logout, password reset")
 * @OA\Tag(name="Products",   description="Product catalogue & sale units")
 * @OA\Tag(name="Categories", description="Product categories")
 * @OA\Tag(name="Brands",     description="Coffee brands")
 * @OA\Tag(name="Orders",     description="Create orders, view history, receipt PDF")
 * @OA\Tag(name="Promos",     description="Promo codes validation & listing")
 * @OA\Tag(name="Settings",   description="App settings, tax config")
 * @OA\Tag(name="Reviews",    description="Product reviews")
 * @OA\Tag(name="Blog",       description="Brew journal / blog posts")
 * @OA\Tag(name="Content",    description="Policy pages, newsletter, testimonials")
 */
abstract class Controller
{
    //
}
