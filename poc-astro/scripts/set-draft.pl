#!/usr/bin/env perl
use strict;
use warnings;

# usage: set-draft.pl <true|false> <file1> <file2> ...
my $value = shift @ARGV;
die "usage: set-draft.pl <true|false> <files...>\n" unless defined $value && ($value eq 'true' || $value eq 'false');

for my $file (@ARGV) {
    open my $fh, '<:encoding(UTF-8)', $file or die "open $file: $!";
    local $/;
    my $s = <$fh>;
    close $fh;

    if ($s =~ /^(---\r?\n.*?)^draft:\s*\S+\s*\r?\n(.*?^---\r?\n)/ms) {
        # existing draft: field, replace value
        $s =~ s/^draft:\s*\S+\s*(\r?\n)/draft: $value$1/ms;
    } elsif ($s =~ /^---\r?\n(.*?)^---\r?\n/ms) {
        # frontmatter present but no draft field, add before closing ---
        $s =~ s/^(---\r?\n(?:.*?\n))(---\r?\n)/$1draft: $value\n$2/ms;
    } else {
        warn "no frontmatter in $file\n";
        next;
    }

    open my $out, '>:encoding(UTF-8)', $file or die "write $file: $!";
    print $out $s;
    close $out;
    print "ok: $file\n";
}
