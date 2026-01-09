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
use App\Http\Controllers\Api\TicketAttachmentController;

// ===== PUBLIC =====
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// ===== PROTECTED =====
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    /**
     * =========================
     * PORTAL ( /portal )
     * Akses: custstaff, viriyastaff, superadmin
     * =========================
     */
    Route::prefix('portal')
        ->middleware(['master_role:custstaff,viriyastaff,superadmin'])
        ->group(function () {
            Route::get('tickets', [PortalTicketController::class, 'index']);
            Route::post('tickets', [PortalTicketController::class, 'store']);
            Route::get('tickets/{ticket}', [PortalTicketController::class, 'show']);
             Route::get('inventory-items', [\App\Http\Controllers\Api\PortalInventoryItemController::class, 'index']);
        });

    /**
     * =========================
     * ADMIN ( /admin )
     * Akses: superadmin
     * =========================
     */
    Route::prefix('admin')
        ->middleware(['master_role:superadmin'])
        ->group(function () {

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

            // Admin Tickets
            Route::get('tickets', [TicketController::class, 'index']);
            Route::post('tickets', [TicketController::class, 'store']);
            Route::get('tickets/{ticket}', [TicketController::class, 'show']);
            Route::delete('tickets/{ticket}/force', [TicketController::class, 'forceDestroy']);

            // optional dropdown role
            Route::get('master-roles', [MasterRoleController::class, 'index']);

            // Contracts
            Route::get('contracts/expiring-soon', [ContractController::class, 'expiringSoon']);
            Route::apiResource('contracts', ContractController::class);

            // Engineers
            Route::get('engineers/candidates', [EngineerController::class, 'candidates']);
            Route::apiResource('engineers', EngineerController::class);

            // Internal setup
            Route::post('team-groups/assign', [TeamManagementController::class, 'assignUserToTeam']);
            Route::post('users/{user}/role', [UserRoleController::class, 'setEngineerRole']);
        });

    /**
     * =========================
     * ENGINEER MODULE (non-admin)
     * Akses: viriyastaff, superadmin
     * =========================
     */
    Route::middleware(['master_role:viriyastaff,superadmin'])->group(function () {
        Route::patch('tickets/{ticket}/status', [TicketStatusController::class, 'update']);
    });

    /**
     * =========================
     * SHARED: Attachments + Comments
     * Akses: custstaff, viriyastaff, superadmin
     * =========================
     */
    Route::middleware(['master_role:custstaff,viriyastaff,superadmin'])->group(function () {

        // Attachments
        Route::get('tickets/{ticket}/attachments', [TicketAttachmentController::class, 'index'])
            ->name('tickets.attachments.index');

        Route::post('tickets/{ticket}/attachments', [TicketAttachmentController::class, 'store'])
            ->name('tickets.attachments.store');

        Route::get('tickets/{ticket}/attachments/{attachment}/download', [TicketAttachmentController::class, 'download'])
            ->name('tickets.attachments.download');

        // Comments (single route)
        Route::post('tickets/{ticket}/comments', [TicketCommentController::class, 'store']);
    });
});

// fallback login route name
Route::get('/login', fn () => response()->json(['message' => 'Unauthorized (Silakan Login)'], 401))
    ->name('login');





