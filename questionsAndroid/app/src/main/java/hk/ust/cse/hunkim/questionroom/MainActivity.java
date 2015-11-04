package hk.ust.cse.hunkim.questionroom;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.ListActivity;
import android.content.DialogInterface;
import android.content.Intent;
import android.database.Cursor;
import android.database.DataSetObserver;
import android.net.Uri;
import android.nfc.Tag;
import android.os.Build;
import android.os.Bundle;

import android.os.CountDownTimer;

import android.os.Handler;
import android.provider.ContactsContract;
import android.provider.MediaStore;

import android.text.InputType;
import android.text.Layout;
import android.util.Base64;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TableLayout;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ImageButton;
import android.graphics.drawable.Drawable;
import android.graphics.Typeface;

import com.firebase.client.DataSnapshot;
import com.firebase.client.Firebase;
import com.firebase.client.FirebaseError;
import com.firebase.client.ValueEventListener;


import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;


import hk.ust.cse.hunkim.questionroom.db.DBHelper;
import hk.ust.cse.hunkim.questionroom.db.DBUtil;
import hk.ust.cse.hunkim.questionroom.question.Question;

public class MainActivity extends ListActivity {

    public static final String Dirtywords[]={"fuck","ass","shit","wtf"};



    private static final String FIREBASE_URL = "https://comp3111-qroom.firebaseio.com/";

    private String roomName;
    private Firebase mFirebaseRef;
    private ValueEventListener mConnectedListener;

    private QuestionListAdapter mChatListAdapter;
    private ImageButton emailOptionButton;
    private String emailAddress = "";
    private String image= "";
    private TextView emailTextView;
    private boolean sendMessageIntervalEnded = true;
    private String emailForSearch;
    private Button exitSearchButton;

    private ImageButton iuButton;

    private DBUtil dbutil;

    public DBUtil getDbutil() {
        return dbutil;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //initialized once with an Android context.
        Firebase.setAndroidContext(this);

        setContentView(R.layout.activity_main);

        Intent intent = getIntent();
        assert (intent != null);

        // Make it a bit more reliable
        roomName = intent.getStringExtra(JoinActivity.ROOM_NAME);
        if (roomName == null || roomName.length() == 0) {
            roomName = "all";
        }

        setTitle("Room name: " + roomName);

        // Setup our Firebase mFirebaseRef
        mFirebaseRef = new Firebase(FIREBASE_URL).child(roomName).child("questions");


        // Setup our input methods. Enter key on the keyboard or pushing the send button
        EditText inputText = (EditText) findViewById(R.id.messageInput);
        inputText.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView textView, int actionId, KeyEvent keyEvent) {
                if (actionId == EditorInfo.IME_NULL && keyEvent.getAction() == KeyEvent.ACTION_DOWN) {

                        sendMessage();

                }
                return true;
            }
        });

        findViewById(R.id.sendButton).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                    sendMessage();


            }
        });

        emailOptionButton = (ImageButton) findViewById(R.id.emailOption);
        emailOptionButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                popUpEmailForm();
            }
        });

        emailTextView = (TextView) findViewById(R.id.email);
        if(emailAddress == "") {
            emailTextView.setVisibility(View.INVISIBLE);
        }
        else {
            emailTextView.setText(emailAddress);
        }

        iuButton = (ImageButton)findViewById(R.id.imageupload);
        iuButton.setOnClickListener(new View.OnClickListener()
        {
            @Override

            public void onClick(View v)
            {
                openGallery(1);
            }
        });

        exitSearchButton = (Button) findViewById(R.id.exitFindByEmail);
        exitSearchButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                resumeAllQuestions();
            }
        });

        // get the DB Helper
        DBHelper mDbHelper = new DBHelper(this);
        dbutil = new DBUtil(mDbHelper);
        
        //we override the onCreate method and add the following code snippet:
        Typeface iconFont = FontManager.getTypeface(getApplicationContext(), FontManager.FONTAWESOME);
        FontManager.markAsIconContainer(findViewById(R.id.icons_container), iconFont);
    }

    @Override
    public void onStart() {
        super.onStart();

        // Setup our view and list adapter. Ensure it scrolls to the bottom as data changes
        final ListView listView = getListView();
        // Tell our list adapter that we only want 200 messages at a time
        mChatListAdapter = new QuestionListAdapter(
                mFirebaseRef.orderByChild("echo").limitToFirst(200),
                this, R.layout.question, roomName);
        listView.setAdapter(mChatListAdapter);

        mChatListAdapter.registerDataSetObserver(new DataSetObserver() {
            @Override
            public void onChanged() {
                super.onChanged();
                listView.setSelection(mChatListAdapter.getCount() - 1);
            }
        });

        // Finally, a little indication of connection status
        mConnectedListener = mFirebaseRef.getRoot().child(".info/connected").addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                boolean connected = (Boolean) dataSnapshot.getValue();
                if (connected) {
                    Toast.makeText(MainActivity.this, "Connected to Firebase", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(MainActivity.this, "Disconnected from Firebase", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onCancelled(FirebaseError firebaseError) {
                // No-op
            }
        });
    }

    @Override
    public void onStop() {
        super.onStop();
        mFirebaseRef.getRoot().child(".info/connected").removeEventListener(mConnectedListener);
        mChatListAdapter.cleanup();
    }

    private void sendMessage()  {
        // Helper countdown for implementing: require post time interval > 5 second
        final CountDownTimer countdown = new CountDownTimer(5000, 1000) {
            public void onTick(long millisUntilFinished) {
                sendMessageIntervalEnded = false;
            }

            public void onFinish() {
                sendMessageIntervalEnded = true;
            }
        };

        // Implement post interval > 5 seconds and
        // input content > 5 letters
        // TODO: add dirty words filter
        EditText inputText = (EditText) findViewById(R.id.messageInput);
        String input = inputText.getText().toString();

        if (!input.equals("") && (input.length() >= 5)) {

            if(containsDirtyWord(input)){
                Toast.makeText(MainActivity.this, "contains Dirty Word", Toast.LENGTH_SHORT).show();
                return;
            }
                




            if (sendMessageIntervalEnded) {
                // Start the counter to count for 5 seconds
                countdown.start();

                // Send message here:
                // Create our 'model', a Chat object
                Question question = new Question(input, emailAddress, image);
                // Create a new, auto-generated child of that chat location, and save our chat data there
                mFirebaseRef.push().setValue(question);
                inputText.setText("");
                image="";
            }
            else {
                CharSequence message = "Please wait 5 seconds before posting next time...";
                final Toast waitToast = Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT);
                waitToast.show();
                // shorten the display time of toast
                Handler handler = new Handler();
                handler.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        waitToast.cancel();
                    }
                }, 1000);
            }

        }
        else {
            CharSequence message = "Your message is too short, please re-enter!";
            final Toast messageShortToast = Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT);
            messageShortToast.show();
            // shorten the display time of toast
            Handler handler = new Handler();
            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    messageShortToast.cancel();
                }
            }, 1000);
        }

    }

    public static boolean containsDirtyWord(String input) {
        for (int i = 0; i < Dirtywords.length; i++) {
            if (input.contains(Dirtywords[i])) {
                return true;
            }
        }
        return false;
    }


    public void updateEcho (String key, final boolean like)
    {
        final Firebase echoRef = mFirebaseRef.child(key).child("echo");
        echoRef.addListenerForSingleValueEvent(
                new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot dataSnapshot) {
                        Long echoValue = (Long) dataSnapshot.getValue();
                        Log.e("Echo update:", "" + echoValue);

                        if(like)
                            echoRef.setValue(echoValue + 1);
                        else
                            echoRef.setValue(echoValue - 1);
                    }

                    @Override
                    public void onCancelled(FirebaseError firebaseError) {

                    }
                }
        );

        final Firebase orderRef = mFirebaseRef.child(key).child("order");
        orderRef.addListenerForSingleValueEvent(
                new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot dataSnapshot) {
                        Long orderValue = (Long) dataSnapshot.getValue();
                        Log.e("Order update:", "" + orderValue);

                        if(like)
                            orderRef.setValue(orderValue - 1);
                        else
                            orderRef.setValue(orderValue + 1);
                    }

                    @Override
                    public void onCancelled(FirebaseError firebaseError) {

                    }
                }
        );

        // Update SQLite DB
        dbutil.put(key);
    }

    public void Close (View view){
        finish();
    }

    public void shareQuestion (String key)
    {
        TextView headText = (TextView) findViewById(R.id.head_desc);
        String msg = "" + headText.getText();
        if(msg.startsWith("<font color=red>NEW </font>")) {
            StringBuilder stringBuilder = new StringBuilder(msg);
            for (int i=0; i<27;i++) {
                stringBuilder.deleteCharAt(i);
            }
            msg = stringBuilder.toString();
        }
        msg = "A Question from QuestionRoom - " + msg;
        System.out.println(msg);

        Intent sharingIntent = new Intent(android.content.Intent.ACTION_SEND);
        sharingIntent.setType("text/plain");
        sharingIntent.putExtra(android.content.Intent.EXTRA_SUBJECT, "A Question from QuestionRoom");
        sharingIntent.putExtra(android.content.Intent.EXTRA_TEXT, msg);
        startActivity(Intent.createChooser(sharingIntent, getResources().getText(R.string.share_to)));
    }

    public void popUpEmailForm ()
    {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);

        final EditText userEmail = new EditText(this);
        userEmail.setInputType(InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
        userEmail.setHint("Enter email");
        if (emailAddress != "") {
            userEmail.setText(emailAddress, null);
        }

        // Set layout of email input box programmatically
        TableLayout.LayoutParams emailParams = new TableLayout.LayoutParams();
        emailParams.setMargins(5, 5, 5, 5);
        userEmail.setLayoutParams(emailParams);

        builder.setTitle("Subscribe the question");
        builder.setView(userEmail)
                .setPositiveButton("Subscribe", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int id) {
                        emailAddress = userEmail.getText().toString();
                        emailTextView.setText(emailAddress);
                        emailTextView.setVisibility(View.VISIBLE);
                    }
                })
                .setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        dialog.cancel();
                    }
                })
        ;

        AlertDialog subscribeAlert = builder.create();
        subscribeAlert.show();
    }

    public void popUpLikeDialog(final String key) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        LayoutInflater inflater = this.getLayoutInflater();
        View dialogView = inflater.inflate(R.layout.activity_like, null);
        builder.setView(dialogView);

        final AlertDialog likeAlert = builder.create();

        dialogView.findViewById(R.id.likeButton).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                updateEcho(key, true);
            }
        });

        dialogView.findViewById(R.id.dislikeButton).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                updateEcho(key, false);
            }
        });

        likeAlert.show();
    }

    public void openGallery ( int req_code)
    {
        Intent intent = new Intent();
        intent.setType("image/*");
        intent.setAction(Intent.ACTION_GET_CONTENT);
        startActivityForResult(Intent.createChooser(intent, "Select file to upload "), req_code);
    }
    public void onActivityResult ( int requestCode, int resultCode, Intent data)
    {

        if (resultCode == RESULT_OK) {
            if (requestCode == 1)

            {
                try {
                    Uri selectedImageUri = data.getData();
                    String selectedPath1 = getPath(selectedImageUri);
                    File file = new File(selectedPath1);
                    long size = file.length();
                    if (size > 5 << 20) {
                        Toast.makeText(MainActivity.this, "file should not greater than 5mb", Toast.LENGTH_SHORT).show();
                        return;

                    }
                    try {
                        FileInputStream ip = new FileInputStream(file);
                        byte[] b = new byte[(int) file.length()];
                        ip.read(b);
                        ip.close();
                        image = Base64.encodeToString(b, Base64.DEFAULT);
                        Toast.makeText(MainActivity.this, "image uploaded", Toast.LENGTH_SHORT).show();

                    } catch (IOException e) {
                        e.printStackTrace();
                    }

                } catch (NullPointerException e){
                    Toast.makeText(MainActivity.this, "failed to load image", Toast.LENGTH_SHORT).show();
                }
            }
        }
    }

    public String getPath (Uri uri)
    {
        String[] projection = {MediaStore.Images.Media.DATA};
        Cursor cursor = managedQuery(uri, projection, null, null, null);
        int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
        cursor.moveToFirst();
        return cursor.getString(column_index);
    }

    public void findPostByEmail(final View view) {
        // First resume to list all questions
        mChatListAdapter.setInputEmail("");
        mChatListAdapter.setSelectPostByEmail(false);
        mChatListAdapter.notifyDataSetChanged();

        // Pop up dialog to get user's email
        AlertDialog.Builder builder = new AlertDialog.Builder(this);

        builder.setTitle(R.string.find_post);

        final EditText userEmail = new EditText(this);
        userEmail.setInputType(InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
        userEmail.setHint("Enter email");

        TableLayout.LayoutParams emailParams = new TableLayout.LayoutParams();
        emailParams.setMargins(5, 5, 5, 5);
        userEmail.setLayoutParams(emailParams);

        builder.setView(userEmail)
                .setPositiveButton("Find Posts", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int id) {
                        emailForSearch = userEmail.getText().toString();
                        userEmail.setText(emailForSearch);
                        System.out.println(emailForSearch);

                        // Display questions with same email
                        mChatListAdapter.setInputEmail(emailForSearch);
                        mChatListAdapter.setSelectPostByEmail(true);
                        mChatListAdapter.notifyDataSetChanged();

                        // Add exit button to show all questions again
                        exitSearchButton.setVisibility(View.VISIBLE);
                        exitSearchButton.setClickable(true);
                    }
                })
                .setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        dialog.cancel();
                    }
                })
        ;

        AlertDialog findPostAlert = builder.create();
        findPostAlert.show();
    }

    public void resumeAllQuestions() {
        mChatListAdapter.setInputEmail("");
        mChatListAdapter.setSelectPostByEmail(false);
        getListView().setAdapter(mChatListAdapter);

        exitSearchButton.setVisibility(View.GONE);
        exitSearchButton.setClickable(false);
    }

    public void setEmailAddress(String newEmail) {
        this.emailAddress = newEmail;
    }
}
