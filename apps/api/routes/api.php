<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\TeamManagementController;
use App\Http\Controllers\Api\UserRoleController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TicketStatusController;
use App\Http\Controllers\Api\TicketCommentController;
use App\Http\Controllers\Api\ProductTypeController;
use App\Http\Controllers\Api\InventoryItemController;
use App\Http\Controllers\Api\TeamGroupController;
use App\Http\Controllers\Api\TeamMemberController;
use App\Http\Controllers\Api\EngineerController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\MasterRoleController;
use App\Http\Controllers\Api\PortalTicketController;

// ===== PUBLIC =====
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// ===== PROTECTED (Bearer Token Sanctum) =====
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // 👇👇👇 STEP 6: ROUTE KHUSUS PORTAL (User Biasa/CustStaff) 👇👇👇
    // Menggunakan 'master_role' yang baru didaftarkan di bootstrap/app.php
    Route::prefix('portal')
        ->middleware(['master_role:custstaff,viriyastaff,superadmin'])
        ->group(function () {
            // List Ticket (Milik Sendiri/Organisasi)
            Route::get('tickets', [PortalTicketController::class, 'index']);
            
            // Buat Ticket Baru (Auto Organization)
            Route::post('tickets', [PortalTicketController::class, 'store']);
            
            // Detail Ticket
            Route::get('tickets/{ticket}', [PortalTicketController::class, 'show']);
        });
    // 👆👆👆 SELESAI STEP 6 👆👆👆

    // ===== SUPER ADMIN & ADMIN AREA =====
    Route::prefix('admin')->group(function () {

        // Organizations: trash/restore/force
        Route::get('organizations/trash', [OrganizationController::class, 'trash']);
        Route::post('organizations/{id}/restore', [OrganizationController::class, 'restore']);
        Route::delete('organizations/{id}/force', [OrganizationController::class, 'forceDelete']);

        // Organizations CRUD
        Route::apiResource('organizations', OrganizationController::class);

        Route::apiResource('organizations.locations', LocationController::class)->shallow();

        Route::apiResource('product-types', ProductTypeController::class);
        
        Route::apiResource('organizations.inventory-items', InventoryItemController::class)->shallow();

        Route::apiResource('team-groups', TeamGroupController::class);


        // Team Members by Team Group
        Route::get('team-groups/{teamGroup}/members', [TeamMemberController::class, 'index']);
        Route::post('team-groups/{teamGroup}/members', [TeamMemberController::class, 'store']);
        Route::put('team-groups/{teamGroup}/members/{user}', [TeamMemberController::class, 'update']);
        Route::delete('team-groups/{teamGroup}/members/{user}', [TeamMemberController::class, 'destroy']);
        Route::get('users', [TeamMemberController::class, 'users']);

         Route::apiResource('users', AdminUserController::class);


        Route::get('tickets', [TicketController::class, 'index']);
        Route::post('tickets', [TicketController::class, 'store']);
        Route::get('tickets/{ticket}', [TicketController::class, 'show']);


        // optional (buat dropdown role di FE)
        Route::get('master-roles', [MasterRoleController::class, 'index']);


        // Contracts
        Route::get('contracts/expiring-soon', [ContractController::class, 'expiringSoon']);
        Route::apiResource('contracts', ContractController::class);


        Route::get('engineers/candidates', [EngineerController::class, 'candidates']);
        Route::apiResource('engineers', EngineerController::class);
        // Internal setup
        Route::post('team-groups/assign', [TeamManagementController::class, 'assignUserToTeam']);
        Route::post('users/{user}/role', [UserRoleController::class, 'setEngineerRole']);
    });

    // ===== ENDUSER & CUSTSTAFF (Comment Only) =====
    Route::middleware('role:enduser|custstaff')->group(function () {
        // Route tickets index/store dipindah ke /portal di atas,
        // Di sini sisa comment saja jika diperlukan
        Route::post('tickets/{ticket}/comments', [TicketCommentController::class, 'store']);
    });

    // ===== ENGINEER & SUPER ADMIN =====
    Route::middleware('role:engineer-manager|engineer-staff|superadmin')->group(function () {
        Route::patch('tickets/{ticket}/status', [TicketStatusController::class, 'update']);
        Route::post('tickets/{ticket}/comments', [TicketCommentController::class, 'store']);

        Route::delete('tickets/{ticket}/force', [TicketController::class, 'forceDestroy'])
            ->middleware('role:engineer-manager|superadmin');
    });
});

// fallback login route name
Route::get('/login', fn () => response()->json(['message' => 'Unauthorized (Silakan Login)'], 401))
    ->name('login');