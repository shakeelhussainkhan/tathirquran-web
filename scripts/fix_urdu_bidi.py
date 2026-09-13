import sys
sys.path.insert(0, '')

try:
    from bidi.algorithm import get_display
    from arabic_reshaper import reshape
    HAS_BIDI = True
except ImportError:
    HAS_BIDI = False
    print("bidi not available, using simple reversal")

def fix_urdu_visual_to_logical(text):
    """
    PDF-extracted RTL text is stored in visual order (left-to-right in the
    string matches left-to-right on screen). To get logical Unicode order we:
      1. Reverse the full string character-by-character
      2. Optionally apply arabic_reshaper cleanup
    """
    if not text:
        return text
    # Reverse entire string to go from visual → logical
    logical = text[::-1]
    if HAS_BIDI:
        try:
            reshaped = reshape(logical)
            return reshaped
        except:
            pass
    return logical

def fix_urdu_word_reverse(text):
    """Alternative: reverse word order (may have been partially applied already)."""
    if not text:
        return text
    words = text.strip().split()
    return ' '.join(reversed(words))

def fix_urdu_word_plus_char(text):
    """Reverse word order AND reverse characters within each word."""
    if not text:
        return text
    words = text.strip().split()
    return ' '.join(w[::-1] for w in reversed(words))

# Current DB samples (after one word-reversal already applied)
samples = [
    ('1:1', 'ا للہ اکے سم تھساکے جو ب س پر ابلا عازام رم کرحم لااونے مؤ، منین خصوپر یبداصی'),
    ('1:2', '۔م رہ للہاحمد کے لئے ہے عاجو لمین رکا ہیب'),
    ('1:3', '۔ب س پر ستحقاابلا عاق رم کرحم لااونے منینمؤ، خصوپر رصی کرحم اونے ہیلا'),
    ('1:4', 'ب۔ما لک ارخہے سزو ا دکے ن (کا دجس کیں حا موکم لا ہوؐعلی )گے'),
    ('1:6', '۔اھدہمیں ی کر رات اصرہ ط مو(مستقیم لا علیؐ وا ار لاونکی ی کی)'),
]

# Expected correct Urdu for reference:
expected = {
    '1:1': 'اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے',
    '1:2': 'سب تعریفیں اللہ کے لیے ہیں جو عالمین کا رب ہے',
    '1:6': 'ہمیں سیدھی راہ دکھا',
}

print("=" * 70)
print("Testing 3 fix approaches on current DB text (after 1 word-reversal)")
print("=" * 70)

for ayah_id, text in samples:
    print(f"\nAyah {ayah_id}:")
    print(f"  DB  : {text}")
    if ayah_id in expected:
        print(f"  WANT: {expected[ayah_id]}")
    print(f"  A) full-string reversal      : {fix_urdu_visual_to_logical(text)}")
    print(f"  B) word-order reversal       : {fix_urdu_word_reverse(text)}")
    print(f"  C) word-reverse + char-rev   : {fix_urdu_word_plus_char(text)}")
