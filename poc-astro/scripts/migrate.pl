#!/usr/bin/env perl
use strict;
use warnings;

# Read file passed as argv, transform, write back.
my $file = $ARGV[0] or die "usage: migrate.pl <file>\n";
local $/;  # slurp
open my $fh, '<:encoding(UTF-8)', $file or die "open $file: $!";
my $s = <$fh>;
close $fh;

# :src="$withBase('X')" -> src="X"
$s =~ s|:src="\$withBase\('([^']+)'\)"|src="$1"|g;
# :href="$withBase('X')" -> href="X"
$s =~ s|:href="\$withBase\('([^']+)'\)"|href="$1"|g;

# Self-close void tags. Handle multi-line img tags too.
$s =~ s|(<img\b[^>]*?)\s*/?>|$1 />|gs;
$s =~ s|<br\s*/?>|<br />|g;
$s =~ s|<hr\s*/?>|<hr />|g;

open my $out, '>:encoding(UTF-8)', $file or die "write $file: $!";
print $out $s;
close $out;
