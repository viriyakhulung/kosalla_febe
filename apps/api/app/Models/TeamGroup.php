<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeamGroup extends Model
{
    use HasFactory;
    
    protected $guarded = ['id'];

    public function users()
{
    return $this->belongsToMany(\App\Models\User::class, 'team_group_user')
        ->withTimestamps();
}


} 