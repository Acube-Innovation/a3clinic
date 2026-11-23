<?php

namespace App\Models;

use App\Models\Lists\ListItem;

/** A question in the homepage FAQ section. */
class HomepageFaq extends ListItem
{
    protected $table = 'homepage_faqs';
}
