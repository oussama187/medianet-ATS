<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            if (Schema::hasColumn('candidates', 'name')) {
                $table->dropColumn('name');
            }
            if (!Schema::hasColumn('candidates', 'first_name')) {
                $table->string('first_name')->after('id');
            }
            if (!Schema::hasColumn('candidates', 'last_name')) {
                $table->string('last_name')->after('first_name');
            }
            if (!Schema::hasColumn('candidates', 'note')) {
                $table->text('note')->nullable()->after('last_name');
            }
            if (!Schema::hasColumn('candidates', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            }
            
            $table->string('email')->change();
        });

        try {
            Schema::table('candidates', function (Blueprint $table) {
                $table->dropUnique('candidates_email_unique');
            });
        } catch (\Exception $e) {
            // Ignore if index doesn't exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->dropColumn(['first_name', 'last_name', 'note', 'user_id']);
            // $table->unique('email'); // Might fail if duplicates exist
        });
    }
};
