<?php
// --- 設定：あなたのメールアドレスを入れてください ---
$to = "broccolinist@gmail.com"; 
$from_name = "Lavi AI Official Site";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // フォームデータの取得
    $subject = $_POST['subject'];
    $name    = $_POST['name'];
    $kana    = $_POST['kana'];
    $email   = $_POST['email'];
    $message = $_POST['message'];

    // メールの本文作成
    $body = "公式サイトからお問い合わせがありました。\n\n"
          . "【件名】: $subject\n"
          . "【名前】: $name ($kana)\n"
          . "【返信先】: $email\n\n"
          . "【内容】:\n$message";

    // メールのヘッダー設定
    $headers = "From: " . mb_encode_with_mimeheader($from_name) . " <$to>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // 言語設定
    mb_language("Japanese");
    mb_internal_encoding("UTF-8");

    // 送信実行
    if (mb_send_mail($to, $subject, $body, $headers)) {
        // 成功したら完了ページ（あるいはトップ）へ
        echo "<script>alert('送信が完了しました。'); location.href='index.html';</script>";
    } else {
        echo "<script>alert('送信に失敗しました。'); history.back();</script>";
    }
} else {
    header("Location: contact.html");
}
?>