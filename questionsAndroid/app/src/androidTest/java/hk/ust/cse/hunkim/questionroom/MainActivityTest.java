package hk.ust.cse.hunkim.questionroom;

import android.app.Activity;
import android.content.Intent;
import android.test.ActivityUnitTestCase;
import android.test.suitebuilder.annotation.MediumTest;
import android.test.suitebuilder.annotation.SmallTest;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.TextView;

import com.firebase.client.Firebase;

import java.lang.reflect.Method;

/**
 * Created by hunkim on 7/20/15.
 */
public class MainActivityTest extends ActivityUnitTestCase<MainActivity> {

    private Intent mStartIntent;
    private ImageButton mButton;

    public MainActivityTest() {
        super(MainActivity.class);
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();
        // In setUp, you can create any shared test data,
        // or set up mock components to inject
        // into your Activity. But do not call startActivity()
        // until the actual test methods.
        // into your Activity. But do not call startActivity()
        // until the actual test methods.
        mStartIntent = new Intent(Intent.ACTION_MAIN);
        mStartIntent.putExtra(JoinActivity.ROOM_NAME, "all");
    }

    @MediumTest
    public void testPreconditions() {
        startActivity(mStartIntent, null, null);
        mButton = (ImageButton) getActivity().findViewById(R.id.sendButton);
        assertNotNull(getActivity());
        assertNotNull(mButton);

        assertEquals("This is set correctly", "Room name: all", getActivity().getTitle());
    }


    @MediumTest
    public void testPostingMessage() {
        Activity activity = startActivity(mStartIntent, null, null);
        mButton = (ImageButton) activity.findViewById(R.id.sendButton);
        final TextView text = (TextView) activity.findViewById(R.id.messageInput);
        final ListView lView = getActivity().getListView();

        assertNotNull(mButton);
        assertNotNull(text);
        assertNotNull(lView);

        getInstrumentation().runOnMainSync(new Runnable() {
            @Override
            public void run() {
                lView.performItemClick(lView, 0, lView.getItemIdAtPosition(0));
            }
        });
        getInstrumentation().waitForIdleSync();

        try {
            Thread.currentThread().sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }


        getInstrumentation().runOnMainSync(new Runnable() {
            @Override
            public void run() {
                text.requestFocus();
            }
        });

        getInstrumentation().waitForIdleSync();

        text.setText("This is test!");
        mButton.performClick();

        // TODO: How to confirm a new text is posted?
        // assertEquals("Child count: ", lView.getChildCount(), 10);
    }

    @SmallTest
    public void testUpdateEcho() {
        startActivity(mStartIntent, null, null);
        String key = "K22MChB9IXi7vRSV99M";
        Firebase echoRef = new Firebase(new String ("https://comp3111-qroom.firebaseio.com/"))
                .child("ACCT1010").child("questions")
                .child(key).child("echo");

        getActivity().updateEcho(key, true);
        // assertTrue("update echo like", echoRef.setValue);

        getActivity().updateEcho(key, false);
        // assertEquals("update echo dislike", echoRef.);
    }

    @SmallTest
    public void testPopUpEmailForm() {
        startActivity(mStartIntent, null, null);
        getActivity().popUpEmailForm();
        getActivity().setEmailAddress("a@b.c");
        getActivity().popUpEmailForm();
    }

    @SmallTest
    public void testPopUpLikeDialog() {
        startActivity(mStartIntent, null, null);
        String key = "K22MChB9IXi7vRSV99M";
        getActivity().popUpLikeDialog(key);
        // Add assert
    }

    @SmallTest
    public void testOnAcitivityResult() {
        startActivity(mStartIntent, null, null);
        Intent intent= new Intent();
        getActivity().onActivityResult(Activity.RESULT_OK,1,intent);
        getActivity().onActivityResult(Activity.RESULT_OK,0,intent);
        getActivity().onActivityResult(Activity.RESULT_CANCELED,1,intent);
    }

    @SmallTest
    public void testDirtyWord() {
        assertTrue("Fuck you contains dirty word", MainActivity.containsDirtyWord("Fuck you"));
        assertFalse("Love you does not contain dirty word", MainActivity.containsDirtyWord("Love you"));
    }

}
