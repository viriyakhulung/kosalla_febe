<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('ticket_attachments', function (Blueprint $table) {
            // Jika kolom ticket_id belum ada, tambahkan + FK ke tickets
            if (!Schema::hasColumn('ticket_attachments', 'ticket_id')) {
                $table->foreignId('ticket_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('tickets')
                    ->cascadeOnDelete();
            }

            // Jika kolom uploaded_by belum ada (untuk berjaga-jaga)
            if (!Schema::hasColumn('ticket_attachments', 'uploaded_by')) {
                $table->foreignId('uploaded_by')
                    ->nullable()
                    ->after('ticket_id')
                    ->constrained('users')
                    ->restrictOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('ticket_attachments', function (Blueprint $table) {
            if (Schema::hasColumn('ticket_attachments', 'ticket_id')) {
                $table->dropConstrainedForeignId('ticket_id');
            }
            if (Schema::hasColumn('ticket_attachments', 'uploaded_by')) {
                $table->dropConstrainedForeignId('uploaded_by');
            }
        });
    }
};
