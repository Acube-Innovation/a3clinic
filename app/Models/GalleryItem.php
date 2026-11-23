<?php

namespace App\Models;

use App\Models\Lists\ListItem;

/** An image in the clinic gallery. */
class GalleryItem extends ListItem
{
    protected $table = 'gallery_items';
}
